const jwt = require('jsonwebtoken');
const bcrypt = require('cookie-parser');
const express = require("express");
const router = express.Router();



// router.post('/register', (request, response)=>{
//     console.log(request.body);
//     const {firstname, lastname, gmail, dob, gender, role, password , conPass} = request.body;
    

//     response.send("form recieved");
// });

module.exports = router;