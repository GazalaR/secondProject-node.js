const { check } = require('express-validator');


exports.registerValidation = [
    check('firstname', 'Firstname is required').not().isEmpty(),
    check('lastname', 'Lastname is required').not().isEmpty(),
    check('email', 'Please Enter valid email').not().isEmpty(),//normalizeEmail(),
    check('phone', 'should be contains 10 digits').isLength({ min: 10, max: 10 }),
    check('password', 'must bo grater than 6  ').not().isEmpty(),
    // isStrongPassword({minNumbers: 1,minLowercase: 1 }),
  
   check('image').custom((value, { req }) => {
  if(req.file.mimetype === 'image/jpg' ||req.file.mimetype === 'image/jpeg'||req.file.mimetype === 'image/webp'){
  return true;
  }else{
    return false;
  }
    }).withMessage('Please upload image an jpg, jpeg, PNG,')
]






