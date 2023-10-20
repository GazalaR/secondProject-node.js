const mongoose=require('mongoose');

var Schema = mongoose.Schema;

const  ProductsSchema =new Schema({


    user_id: {
        type:mongoose.Schema.ObjectId,
        ref:'users'
    //    required: true
    },
    product_id:{
        type:mongoose.Schema.ObjectId,
        ref:'products',
        // required: true
    },


       
},{ timestamps: true }
);

module.exports = mongoose.model('user_products', ProductsSchema);
