const mongoose= require('mongoose');

var Schema = mongoose.Schema;

const  ProductSchema =new Schema({
    
    user_id:[{
        type: mongoose.Schema.ObjectId,
        ref:'users'
    //    required: true
    }],

    name: {
        type: String,
    //    required: true
    },
    price: {
        type: String,
        // required: true
    },

    category: {
        type: String,
    //    required: true
    },

    company:{
        type:String,
        // required:true
    },
    image:{
        type:String
    },
    token: {
        type: String,
        // default: ''
    }, 
       
},{ timestamps: true }
);

module.exports = mongoose.model('products', ProductSchema);
