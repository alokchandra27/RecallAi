const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {

    const {fullName: {firstName, lastName}, email, password} = req.body;

    const isUserExists = await userModel.findOne({email});

    if(isUserExists){
        return res.status(400).json({message: "User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
        fullName: {
            firstName,
            lastName
        },
        email,
        password: hashedPassword
    });

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        },
        token
    })

}


async function loginUser(req,res){
    const {email, password} = req.body;

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({message: "Invalid email or password"});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({message: "Invalid email or password"});
    }

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email
        },
        token
    })
}

module.exports = {
    registerUser,
    loginUser
}