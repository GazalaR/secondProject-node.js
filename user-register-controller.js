const User = require('../models/user-register');
const userPro = require('../models/products');
const Product = require('../models/product.js');
const bcrypt = require('bcrypt');
const config = require('../configs/config')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');






const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt)
        return token;
    } catch (err) {
        res.send(err.message);
    }
}

exports.user_register = async (req, res) => {   //register user
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const salt = await bcrypt.genSalt(10);
        const secpass = await bcrypt.hash(req.body.password, salt)
        const body = req.body;


        const data = new User({
            product_id: body.product_id,
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            phone: body.phone,
            password: secpass



        });
        if (req.file) {
            data.image = req.file.path
        }

        console.log(data)

        const result = await User.findOne({ email: body.email });
        if (result) {
            console.log(result)
            res.send({ result: "email alredy exist" });
        } else {
            const result1 = await data.save();
            res.send(result1);
        }
    }
    catch (err) {
        console.log(err.message)
        console.warn("occur erorr");
    }
}
exports.user_login = async (req, res) => {  //login  user
    try {
        const body = req.body;
        const email = body.email;
        const password = body.password;
        const data = await User.findOne({ email: email });
        if (data) {

            const passwordMatch = await bcrypt.compare(password, data.password);
            if (passwordMatch) {
                const tokendata = await create_token(data._id);
                const result = {
                    _id: data._id,
                    email: data.email,
                    password: data.password,
                    data: data,
                    token: tokendata
                }
               
                // bcrypt.genSalt(10, function (err, salt) {
                //     bcrypt.hash(data.password, salt, (err, hash) => {
                //         data.password = hash;
                //         data.save();
                //         return res.json({ data });
                //     });
                // });
                return res.send(result);
            } else {
                res.send({ result: "incorrect login detail" });
            }
        } else {
            res.send({ result: "incorrect login details" });
        }

    }
    catch (err) {
        console.log(err.message)
        return res.status(400).send('Something went wrong. Try again');
    }

}
exports.change_password = async (req, res) => { //password update
    try {

        const oldPassword = req.body.oldpassword;
        const updatedPassword = req.body.updatedPassword;
        const _id = req.body._id


        const data = await User.findById({ _id: _id });
        console.log(data)


        const isMatch = await bcrypt.compare(oldPassword, data.password)
        console.log(isMatch)

        if (isMatch == true) {
            const salt = await bcrypt.genSalt(10);
            const secpass = await bcrypt.hash(req.body.updatedPassword, salt)
            await User.updateOne({ _id: _id }, { $set: { password: secpass } })
            return res.send("changed")
        }
        else {
            return res.send("old password is incorrect")
        }


    } catch (err) {
        console.log(err.message);
        return res.status(400).send('Something went wrong. Try again');
    }
}
exports.update_user = async (req, res) => {
    try {
        //    console.awar("error")
        //     if (!req.body) {
        //         return res.status(400).send({ message: "Data to update can not be empty!" });
        //       }

        const body = req.body;
        // const _id = req.params._id;
        // const salt = await bcrypt.genSalt(10);
        // const secpass = await bcrypt.hash(req.body.password, salt)

        const result = await User.findByIdAndUpdate({ _id: req.params._id }, {
            $set: {
                firstname: body.firstname,
                lastname: body.lastname,
                email: body.email,
                phone: body.phone,
                password: body.password, //secpass,
                product_id: body.product_id
                // image:req.file.filename
            }
        });

        console.warn(result);
        res.status(200).json({ update_user: result })

    } catch (err) {
        res.status(401).send(err.message)
    }

}
exports.list_user = async (req, res) => {
    try {
        var search = req.body.search

        const data = await User.find(
            {

                //    "lastname": { $regex: '.*' +search+ '.*', $options: 'i' },
                //     "email": { $regex: ".*" +search+ ".*", $options: 'i' },

                "$or":
                    [
                        { firstname: { $regex: ".*" + search + ".*", $options: 'i' } },
                        { lastname: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { phone: { $regex: '.*' + search + '.*', $options: 'i' } },// not searching nummber
                        { password: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { image: { $regex: '.*' + search + '.*', $options: 'i' } }
                    ]
            }
        );
        res.send(data);
        // console.warn(data);

    }
    catch (error) {
        console.warn(error.message);

        return res.status(500).json({ message: error.message })
    }
}
exports.pagination = async (req, res) => {
    try {
        // let keyword= req.query.keyword;
        //  data = await User.aggregate([{$match: {firstname:keyword}}]);
        let match = {};
        if (req.query.keyword) {  // ******search by keyword=firstname,etc 
            // match.email = new RegExp(req.query.keyword, "i");
            match.$or = [{ firstname: new RegExp(req.query.keyword, "i") }, //filter data
            { lasttname: new RegExp(req.query.keyword, "i") },
            { email: new RegExp(req.query.keyword, "i") },
            { password: new RegExp(req.query.keyword, "i") },
            { phone: new RegExp(req.query.keyword, "i") }
            ];
        }
        // if (req.query.phone) {
        //     match.phone = parseInt(req.query.phone);
        // }
        data = await User.aggregate([{ $match: match }]);

        // var search = req.body.search
        let page = Number(req.body.page) // || 1;
        let limit = Number(req.body.limit) // || 5;
        let sort = req.body.sort;
        var data;
        if (sort) {
            var customsort;
            if (sort == 'firstname') {
                customsort = { firtname: -1 }// ascending order
            } else if (sort == '_id') { customsort = { _id: 1 } } //decending order
            data = await User.aggregate([{ $match: match }]
                // data =await User.find(
                //     { "$or": 
                //  [
                //      { firstname: { $regex: ".*" + search + ".*", $options: 'i' } }, //search data
                //      { lastname: { $regex: '.*' + search + '.*', $options: 'i' } },
                //      { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                //      { phone: { $regex: '.*' + search + '.*', $options: 'i' } },
                //      { password: { $regex: '.*' + search + '.*', $options: 'i' } },
                //      { image: { $regex: '.*' + search + '.*', $options: 'i' } }
                //  ] }
            ).sort(customsort).skip(page).limit(limit);

            // console.warn(data);
        } else {
            data = await User.aggregate([{ $match: match }]).sort(customsort).skip(page).limit(limit);
        }

        return res.status(200).json({ result: "Users", data, nbHits: data.length })

    } catch (error) {
        console.warn(error.message);
        return res.status(500).json({ message: error.message })
    }
}
exports.delete_user = async (req, res) => {
    try {
        // const _id = req.params._id;

        const result = await User.findByIdAndDelete({ _id: req.params._id });

        //  console.warn(result);
        res.status(200).json({ result: "user deleted" })

    }
    catch (error) {
        console.warn(error.message);
        res.status(400).json({ message: error.message })
    }
}
// products start 
exports.add_product = async (req, res) => {
    try {
        // let Product= {};
        const data = await new Product({
            // user_id:req.body.user_id,
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            company: req.body.company,
            image: req.body.image
        });
        if (req.file) {
            data.image = req.file.path
        }
        const Data = await data.save();
        return res.status(200).json({ succes: true, Data });

    }
    catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
// exports.get_product = async (req, res) => {
//     try {

//         // const data = await Product.findById({ _id: req.params._id });
//         const data = await Product.findOne({ _id: req.params._id });

//         console.warn(data);

//         return res.status(200).json({ succes: true, data })
//         // return Product.find();


//     } catch (error) {
//         console.warn(error.message);
//         res.status(404).json({ succes: false, message: error.message })
//     }
// }
exports.update_product = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate({ _id: req.params._id }, {
            $set: {
                user_id: req.body.user_id,
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
                company: req.body.company,
                image: req.body.image
            }
        });

        console.warn(result);
        res.status(200).json({ update_product: result })

    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
exports.list_product = async (req, res) => {
    try {
        const data = await Product.find();
        return res.status(200).json({ succes: true, data })
    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
exports.get_product = async (req, res) => {   //user product
    try {
        // var productData = await Product.find();
        var productData = await User.aggregate([{ // user add
            $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "Product_Details"
            }
        }]);
        console.warn(productData);
        res.status(200).json({ success: true, Data: productData })

    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}
exports.Up_pagination = async (req, res) => {   //user product
    try {
        let { firstname, lastname, email, phone } = req.query;
        let match = {};
        if (req.query.firstname) {
            match.firstname = new RegExp(firstname, "i")  //filter data
        }
        if (req.query.lastname) {
            match.lastname = new RegExp(lastname, "i")  
        }
        if (req.query.email) {
            match.email = new RegExp(email, "i")  
        }
        if (req.query.phone) {
            match.phone =parseInt(phone, "i")  
        }
          let keyword= req.query.keyword;
        if (keyword) {  // ******search by keyword=firstname,etc 
            match.$or = [{ name: new RegExp(keyword, "i") }, //products  filter data
            { price: new RegExp(keyword, "i") },
            { category: new RegExp(keyword, "i") },
            { company: new RegExp(keyword, "i") }, ];
        }

        let page = Number(req.query.page)
        let limit = Number(req.query.limit)
      
        const data = await User.aggregate([{ $match: match }] //{firstname:'me'}}]//users

           ).skip(page).limit(limit);
        //    const data = await Product.aggregate([{ $match: match }] ).skip(page).limit(limit); //products
        
        return res.status(200).json({ result: "Users", data, nbHits: data.length })//users
        // return res.status(200).json({ result: "Product", data, nbHits: data.length })//products
    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}


get_Product = async (req, res) => {
    try {
        // return Product.find();  
        return productData = await User.aggregate([{ // user add
            $lookup: {
                from: "products",
                localField: "product_id",
                foreignField: "_id",
                as: "Product_Details"
            }
        }]);
        // return  productData= await Product.aggregate([{ // user add
        //     $lookup:{
        //         from:"users",
        //         localField:"user_id",
        //         foreignField:"_id",
        //         as:"user"
        //     }
        // }]);


    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ success: false, message: error.message })
    }
}
exports.user_product = async (req, res) => {
    try {

        var send_data = [];
        var pro_id = await get_Product();


        const data = await new userPro({
            user_id: req.body.user_id,
            // product_id:pro_id
        });
        send_data.push({
            "User_product": data,
            "User_details": pro_id

        });
        // const Data= await send_data.save(); 

        return res.status(200).json({ success: true, send_data })

    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
exports.user_pro = async (req, res) => { // product assign to users
    try {
        const data = await User.find({ _id: req.body.user_id }).populate('product_id');
        // const data = await Product.find({_id:req.body.product_id}).populate('user_id');  //population 

        res.status(200).json({ success: true, data })

    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
exports.user_pro1 = async (req, res) => {
    try {

        // const data = await Product.find({_id:req.body.product_id}).populate('user_id');  //population 
        const data = await User.find().populate({
            path: 'product_id',
            // $match: {name:'Vivo'}   //match product
            select: ["name", "price"],   //select product
            options: {
                sort: { name: 1 },      //ascending and decendng products name
                limit: 2}      
        });
        return res.status(200).json({ success: true, data })
} catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}
exports.users_products = async (req, res) => {
    try {
        const data = await new userPro({
            user_id: req.body.user_id,
            product_id: req.body.product_id
        });

        const Data = await data.save();

        return res.status(200).json({ success: true, Data })

    } catch (error) {
        console.warn(error.message);
        res.status(404).json({ succes: false, message: error.message })
    }
}