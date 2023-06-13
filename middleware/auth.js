import jwt from 'jsonwebtoken'

export function Auth(req,next) {
   const token = req.header("x-auth-token")
   if(!token) return res.status(401).send("unAuthanticate")
         
   const verify =  jwt.verify(token,process.env.PRIVATE_KEY)
   if(!verify) return res.status(401).send("Invaild Token")

   next()
}