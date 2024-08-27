const User = require('../models/user')
const { hashPassword, comparePassword } = require('../helper/auth')
const jwt = require('jsonwebtoken')

const test = (req, res) => {
    res.json('test is working');
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                error: 'No user found'
            })
        }

        const match = await comparePassword(password, user.password)

        if (match) {
            jwt.sign({ email: user.email, id: user._id, name: user.name}, process.env.JWT_SECRET, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(user);
            })
        }
        if (!match) {
            res.json({
                error:'Password do not match'}
            );
        }
    } catch (error) {
        console.log(error);
    }
}
const registerUser = async (req, res) => {
    try {
        const { name, password, email } = req.body;

        if (!name) {
            return res.json({
                error: 'Name is required'
            })
        };

        if (!password || password.length < 6) {
            return res.json({
                error: 'Wrong password'
            })
        };

        const exist = await User.findOne({ email });

        if (exist) {
            return res.json({
                error: 'Email is taken already'
            })
        };

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        return res.json(user)
    } catch (error) {
        console.log(error);
    }
}
const getProfile = (req, res) => {
    const { token } = req.cookies;

    if(token){
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if(err) throw err;
            res.json(user)
        })
    }else{
        res.json(null)
    }
}

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile
}