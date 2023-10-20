const multer = require('multer');
const path = require('path');
// const express = require('express');
//  const bodyParser = require('body-parser');
// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser, bodyParser.urlencoded({ extended: true }));

exports.multerConfig = (multer) => {
    const storage = multer.diskStorage({
        destination:function (req, file, cb){
            cb(null, path.join(__dirname, '../public/images')); 
},
filename:function(req,file,cb){
    let ext=path.extname(file.originalname)
    const name=Date.now()+'-'+ext;
    cb(null,name);
}
    });

    const fileFilter = (req, file, cb) => {
        (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp')
            ? cb(null, true)
            : cb(null, false)
    };

    return multer({
        storage: storage,
        // limits: { fileSize: 1048576 },
        fileFilter: fileFilter
    });
};