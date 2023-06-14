const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const user = require('./router/users');
const auth = require('./router/auth');
const conversation = require('./router/conversation');
const message = require('./router/message');
const http = require('http')
const {Server} = require('socket.io');
const path = require('path');

require('dotenv').config()


mongoose.set('strictQuery',false)
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("successfully connected"))
.catch(err=>console.error(err))

//middleware
app.use(express.static(path.join(__dirname),'public'))
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin x-auth-token access-control-expose-headers Content-Type, Accept");
  next()
})
app.use(cors({origin:"*"}))
app.use(express.json());
app.use(express.urlencoded({extended:true}))
// app.use(express.static('public'));
// app.use('/uploads',express.static('uploads'));
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(morgan("common"));
app.use("/api/user",user);
app.use("/api/auth",auth);
app.use("/api/conversation",conversation);
app.use("/api/message",message);

const server = http.createServer(app);
const io = new Server(server,{cors: {origin: "*",
}})

let users = [];

app.get("/", async(req,res)=>{
  res.status(200).send("backend working properly")
})

const addUser=(userId,socketId)=>{
  if(userId,socketId){
    !users.some(user=>user.userId===userId) && users.push({userId,socketId})
  }}

const removeuser=(socketId)=>{
  users = users.filter(user=> user.socketId!==socketId);
}

const getuser = (receiverId)=>{
  console.log(users,"users");
  return users.find(user=>user.userId===receiverId);
}

let lastView = [];

const addLastView = (userId,socketId)=>{
  !lastView.some(view=>view.userId===userId) && lastView.push({userId,socketId,lastSeen:""})
}

const removeLastView = (socketId)=>{
  let filterView = lastView.filter(view=>view.socketId!==socketId)
  let disconnectUser =  lastView.filter(view=>view.socketId===socketId)
  disconnectUser.map(user=>user.lastSeen=new Date());
  lastView = [...filterView,...disconnectUser]
}



io.on("connection",(socket)=>{
  console.log("user connected");
   
socket.on("adduser",(userId)=>{
  addUser(userId,socket.id);
  addLastView(userId,socket.id);
  console.log(users);
       io.emit("getusers",users)
       io.emit("getHistory",lastView)
})


socket.on("sendmessage",(payload)=>{
  // io.emit("sendmessage",payload)
  console.log(payload);
  const user = getuser(payload.receiverId);
  console.log(user,"user");
  io.to(user?.socketId).emit("getMessage",payload)
})

  socket.on("disconnect",()=>{
    console.log("a user disconnect");
    removeuser(socket.id);
    removeLastView(socket.id);
    console.log(users);
    io.emit("getusers",users)
    io.emit("getHistory",lastView)
  })
})


server.listen(5000,()=>
console.log("listening to port no 5000"))
