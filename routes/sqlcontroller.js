const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({path: './.env'})

const connection = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DATABASE,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE, 
    port: '3306', 
    connectionLimit: 10

    // here you can set connection limits and so on
});
connection.on('error', function() {
    console.log('error occur on connection');
});

console.log(process.env.DBPASSWORD);

module.exports.text2sql = (text)=> connection.escape(text);

module.exports.connectDB =  async function toConnectDB(cmd){
    const con = await connection.getConnection();      

    const row = await con.query(cmd);
    con.release();
    return row;
}