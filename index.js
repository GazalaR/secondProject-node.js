const express= require ('express');
const mongoose= require('mongoose');
const routes= require('./routes/user-register.js')

const cors=require('cors');
const app=express();
app.use(cors());

app.use(express.urlencoded({extended:true}));
app.use('./public/images',express.static('public/images'));

mongoose.set('strictQuery',false);

const RegisterRoute= require('./routes/user-register');

mongoose.connect(`mongodb://127.0.0.1:27017/demoApi`,
function checkDB(error)
{
    if(error){
        console.log("error occur");
    }else{
        console.log("successfuly connected")
    }
}); 

app.use(express.json());
app.use(routes);
app.listen(5000,function port(error){
    if(error){
        console.log("Errors...")
    }else{
        console.log("successful")
    }
});

app.use('/api', RegisterRoute);
