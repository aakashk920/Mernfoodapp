const express = require('express');
const router = express.Router();
const User = require("../models/User.js");
const { body, validationResult } = require('express-validator');
const bcrypt= require ( "bcryptjs");
const jwt=require ( "jsonwebtoken");
const jwtSecret="MyNameistheaakashkashyapand"


router.post("/createuser", [
    body('email').isEmail(),
    body('name').isLength({ min: 5 }),
    body('password').isLength({ min: 5 }).withMessage('Password does not meet the minimum length'),
], async (req, res) => {
    const errors = validationResult(req);

    // Check if there are validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Send validation error messages in the response
    }
    const salt= await bcrypt.genSalt(10);
    let secPassword=await bcrypt.hash(req.body.password, salt);
    try {
        await User.create({
            name: req.body.name,
            password: secPassword,
            email: req.body.email,
            location: req.body.location
        });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});


router.post("/loginuser", [
    body('email').isEmail(),
    body('password').isLength({ min: 5 }).withMessage('Password does not meet the minimum length'),
]
    , async (req, res) => {
        let email = req.body.email;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // Send validation error messages in the response
        }
        try {
            let userData = await User.findOne({ email });
            if (!userData) {
                return res.status(400).json({ errors: "try logging with the correct credentials" })
            }

            const pwdCompare = await bcrypt.compare(req.body.password, userData.password);


            if (!pwdCompare) {
                return res.status(400).json({ errors: "Try logging with correct credentials" })
            }
                const data = {
                    user:{
                        id:userData.id
                    }

                }
                const authToken=jwt.sign(data, jwtSecret)
            return res.json({ success: true,authToken:authToken });
        } catch (error) {
            console.error(error);
            res.json({ success: false });
        }
    });

module.exports = router;
