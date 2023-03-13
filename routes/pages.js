const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
    // res.send('<h1>Hello World</h1>');
    res.render('index');
});

router.get('/register', function (req, res) {
    res.render('register');
});

module.exports = router;