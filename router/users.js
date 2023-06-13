const router =require('express').Router();
const { length } = require('body-parser');
const User = require('../model/users');
const bcrypt = require('bcrypt')


//get all user
router.get("/",async(req,res)=>{
    const allUser = await User.find().select('_id username email profilePicture desc');
    try {
        res.status(200).send(allUser);
    } catch (err) {
        res.status(500).send(err);
    }
})

// update user
router.put("/:id",async(req,res)=>{
    if(req.body.userId===req.params.id || req.body.isAdmin){
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password,salt)
            } catch (err) {
                return res.status(500).send(err)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id,{$set:req.body})
            res.status(200).send("account has been updated")
        } catch (err) {
            return res.status(500).send(err)
            
        }
    }else{
        return res.status(403).json("you can update only your account")
    }
});

// update user
router.put("/update/:id",async(req,res)=>{
        try {
            let user = await User.findByIdAndUpdate(req.params.id,{$set:req.body})
            console.log(user,"user");
            if(!user) return res.status(404).send("user not Found")
            
            // after update
            const updateUser = await User.findById(req.params.id).select("_id username email profilePicture desc")
            // console.log(updateUser);
            res.status(200).send(updateUser)
        } catch (err) {
            return res.status(500).send(err)
            
        }
});

//delete user
router.delete("/:id",async(req,res)=>{
    if(req.body.userId===req.params.id || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).send("account has been deleted")
        } catch (err) {
            return res.status(500).send(err)
            
        }
    }else{
        return res.status(403).json("you can delete only your account")
    }
});





module.exports = router;