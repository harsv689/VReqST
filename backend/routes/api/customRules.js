const express = require("express");
const Router = express.Router();
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const config = require("config");
const { body, validationResult } = require("express-validator");


// Load CustomRules model
const CustomRule = require("../../models/CustomRules");
const authenticate = require("../../middlewares/auth");

Router.post("/upload-custom-rule", 

    [
        body("username").isAlphanumeric().notEmpty(),
        body("email").isEmail().notEmpty(),
        body("password").isLength({ min: 6 }).notEmpty(),
        body("organization").notEmpty(),
        body("name").notEmpty(),
    ],

    (req,res)=>{

        const rule = new CustomRule({
            project_id: req.body.data.project_id,
            rulename: req.body.data.rulename,
            data_name: req.body.data.data_name,
            description: req.body.data.description
        });

        rule.save();
        res.send("hiii");
    }
);

Router.post("/get-custom-rules", 

    [
        body("username").isAlphanumeric().notEmpty(),
        body("email").isEmail().notEmpty(),
        body("password").isLength({ min: 6 }).notEmpty(),
        body("organization").notEmpty(),
        body("name").notEmpty(),
    ],

    (req,res)=>{
        CustomRule.find({project_id: req.body.data.project_id})
            .then((found)=>{
                console.log("HERE LOOK .....");
                console.log(found);
                res.send(found);
            })
            .catch((err)=>{
                console.log(err);
            })
    }
);

module.exports = Router;