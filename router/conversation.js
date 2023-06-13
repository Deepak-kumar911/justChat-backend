const router = require('express').Router();
const Conversation = require('../model/convertation');

router.post("/",async(req,res)=>{
    const newConversation =new Conversation({
        members:[req.body.senderId,req.body.receiverId]
    })
    try {
        await newConversation.save();
        res.status(200).send(newConversation)
    } catch (err) {
        res.status(500).send(err)
        
    }
})


router.get("/:userId",async(req,res)=>{
    try {
        const conversation = await Conversation.find({members:{$in:[req.params.userId]}})
        if(!conversation) return res.status(404).send("not found")

        res.status(200).send(conversation)

    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router;