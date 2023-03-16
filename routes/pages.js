const { text } = require("express");
const express = require("express");
const router = express.Router();

router.get('/', function (req, res) {
    // res.send('<h1>Hello World</h1>');
    res.render('index');
});

router.get('/register', function (req, res) {
    res.render('register');
});

router.get('/single', function (req, res) {
    const text = `${req.url}`;
    const id = text.toString().substring(text.length-4)
    console.log(id);
    res.render('single', {

    });
});

module.exports = router;