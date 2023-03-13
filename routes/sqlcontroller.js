const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({path: './.env'})

const connection = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DATABASE,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE, 
    port: '3306', 
    // here you can set connection limits and so on
});
console.log(process.env.DBPASSWORD);
// connection.connect(function(err) {
//     if (err) throw err
//     console.log('connected')
//   })
module.exports = connection;