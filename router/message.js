const router = require('express').Router();
const Message = require('../model/message');

router.post("/",async(req,res)=>{
    const newMessage = new Message(req.body);
    try {
        await newMessage.save();
        res.status(200).send(newMessage)
    } catch (err) {
        res.status(500).send(err)
    }
})

router.get("/:conversationId",async(req,res)=>{
    try {
        const message = await Message.find({
            conversationId:req.params.conversationId
        });
        res.status(200).send(message)
    } catch (err) {
        
    }
})

module.exports = router;