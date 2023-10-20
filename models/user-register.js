const mongoose=require('mongoose');

var Schema = mongoose.Schema;

const  RegisterSchema =new Schema({

    firstname: {
        type: String,
       // required: true
    },
    lastname: {
        type: String,
        //required: true
    },

    email: {
        type: String,
       //required: true
    },

    phone: {
        type: String,
        //required: true
    },

    password: {
        type: String,
        //required: true
    },
    cpassword:{
        type:String
    },
    image:{
        type:String
    },

    token: {
        type: String,
        //default: ''
    }, 
    product_id:[{
        type:mongoose.Schema.ObjectId,
        ref:'products',
        // required: true
    }],
       
},{ timestamps: true }
);


module.exports = mongoose.model('users', RegisterSchema);