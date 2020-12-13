const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const {jwtSecret} = require('../config/constant');

const db = require('../models/index');
const {User} = require('../models/index');

const mailService = require('./mailService');

exports.register = async(req) => {

    let result = {
        message:'',
        token:''
    }
    try{
        const checkemail = await db.sequelize.query(`Select* from user
            where user.email = '${req.body.email}'`,{
            type: db.sequelize.QueryTypes.SELECT
        });
        if (checkemail.length != 0){
            result.message = "Email is used !";
            return result;
        }
    } catch (err){
        console.log(err);
        return err;
    }
    
    let { password,email } = req.body;
    password = await bcrypt.hash(password, 10);
    // CREATE USER
    const payload = { email: email ,password:password};
    const jwtToken = jwt.sign(payload, jwtSecret);
    try{
        const resultMail = await mailService.sendMailRegister(email,jwtToken);
        result.message = 'Success';
        return result;
    } catch (err){
        console.log(err);
        result.message = 'Failed';
        return result;
    }

    // try{
    //     const newUser = await User.create({
    //         ...req.body,
    //         password: password,
    //         avatar: avatar,
    //         createdAt: moment(),
    //         updatedAt: moment()
    //     });
    //     // const payload = { email: newUser.dataValues.email, user_id: newUser.dataValues.user_id };
    //     const jwtToken = jwt.sign(payload, jwtSecret);
    //     result.message = 'Success'
    //     result.token = jwtToken;
    //     return result;
    // } catch(err){
    //     console.log(err);
    //     result.message = "Failed to create user";
    //     return result;
    // }
    // return null;
}

exports.login = async(req) => {
    let result = {
        message:'',
        token:''
    };

    try{
        const checkemail = await db.sequelize.query(`Select* from user
            where user.email = '${req.body.email}'`,{
            type: db.sequelize.QueryTypes.SELECT
        });
        if (checkemail.length === 0){
            result.message = "Email is not exited !";
            return result;
        }
        let { password } = req.body;
        const resultPassword = await bcrypt.compare(password,checkemail[0].password);
        if(resultPassword === false){
            result.message = "Password is wrong !";
            return result;
        }
        const payload = { email: checkemail[0].email, user_id: checkemail[0].user_id };
        const jwtToken = jwt.sign(payload, jwtSecret);
        result.message = 'Success';
        result.token = jwtToken;
        return result;

    } catch (err){
        console.log(err);
        return err;
    }
    return null;
}

exports.authRegister = async(req) => {
    let result = {
        message:'',
        token:''
    }
    const {token} = req.body;
    const data = await jwt.verify(token,jwtSecret);
    let avatar = null;
    if (req.body.avatar === undefined)
        avatar = "/images/avatars/avatar.png";
    try{
        const newUser = await User.create({
            ...data,
            avatar: avatar,
            createdAt: moment(),
            updatedAt: moment()
        });
        const payload = { email: newUser.dataValues.email, user_id: newUser.dataValues.user_id };
        const jwtToken = jwt.sign(payload, jwtSecret);
        result.message = 'Success';
        result.token = jwtToken;
        return result;
    } catch(err){
        console.log(err);
        result.message = "Failed to create user";
        return result;
    }
    return null;
}
// where user.email = ${req.body.email}