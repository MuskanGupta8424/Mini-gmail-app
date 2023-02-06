const mongoose = require('mongoose');
var mailSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    read:{
        type:Boolean,
        default:false
    },
    receiver: String,
    mailtext: String
})
module.exports = mongoose.model('mail', mailSchema);