const connectFunc = require('./sqlcontroller');


module.exports.getbydb = async function getbydb(command) {
    const [rows] = await connectFunc.connectDB(command);
    console.log(rows);
    return rows;
} 

module.exports.getcate = async function getcate() {
    const [rows] = await connectFunc.connectDB("SELECT * FROM bookingCategory");
    console.log(rows);
    return rows;
} 


module.exports.getTeachers = async function getTeachers() {
    const [rows] = await connectFunc.connectDB("SELECT TID, firstName, lastName, gender FROM teacher ORDER BY TID");
    console.log(rows);
    return rows;
} 



global.userdata = {};

global.bookingFormData = {};