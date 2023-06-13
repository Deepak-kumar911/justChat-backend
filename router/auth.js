const router = require('express').Router();
const User = require('../model/users');
const bcrypt = require('bcrypt');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}${file.originalname}` 
      cb(null, uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })

router.post("/register", upload.single("avatar"), async (req, res) => {
    const username = await User.findOne({ username: req.body.username });
    if (username) return res.status(400).send("username must be unique");

    const email = await User.findOne({ email: req.body.email });
    if (email) return res.status(400).send("email already register");
    try {
        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            desc:"Hey, I am using JustChat!",
            profilePicture: `uploads/${req.file.filename}`
        })

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);            
        await user.save();
        const token = await user.generateAuthToken();
        res.header("x-auth-token",token).header("access-control-expose-headers","x-auth-token").status(201).send(token)

    } catch (err) {
        res.status(400).send(err)
    }
});

router.post("/login",async(req,res)=>{
    try {
        const user = await User.findOne({email:req.body.email});
        if(!user) return res.status(404).send("Not Found User");
    
        const validate = await bcrypt.compare(req.body.password,user.password);
        if(!validate) return res.status(400).json("Not validate password");

        const token = await user.generateAuthToken();
        res.header("x-auth-token",token).header("access-control-expose-headers","x-auth-token").status(201).send()
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }


})

module.exports = router;