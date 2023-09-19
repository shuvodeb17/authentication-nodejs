const {Schema, model} = require('mongoose');

const UsersSchema = new Schema({
    name:{
        type:String
    },
    username:{
        type:String,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
    }
})

const Users = model('Users', UsersSchema);
module.exports = Users