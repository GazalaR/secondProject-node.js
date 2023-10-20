const express =require('express');
const router= express();
const auth= require('../middleware/auth')
const {registerValidation}= require('../middleware/validation')
const {multerConfig}=require('../middleware/fileUpload')
const multer = require('multer');
const upload = multerConfig(multer);
router.get('/',auth,function(req,res){
    res.send("authentication")
});
const user_controller= require('../controllers/user-register-controller.js');
// const userRegister = require('../models/user-register');

router.post('/user',upload.single('image'),registerValidation, user_controller.user_register);
router.post('/user_login', user_controller.user_login);
router.post('/change_password',auth,user_controller.change_password);
router.patch('/update/:_id',auth,user_controller.update_user);
router.get('/list/:search',auth,user_controller.list_user);
router.post('/pagination/',user_controller.pagination)
router.delete('/delete/:_id',auth,user_controller.delete_user)

router.post('/add_product',upload.single('image'),registerValidation,user_controller.add_product)
router.patch('/update_product/:_id',user_controller.update_product)
router.get('/list_product/',user_controller.list_product);
router.get('/get_product/:_id',user_controller.get_product)
router.get('/Up_pagination/',user_controller.Up_pagination)

router.post('/user_product/',user_controller.user_product)
router.post('/user_product/populate',user_controller.user_pro)// product assign to users
// router.post('/user_product/pop',user_controller.user_pro1)
router.post('/users_products',user_controller.users_products)
module.exports= router;