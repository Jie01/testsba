const mysql = require("mysql2/promise");
const dotenv = require('dotenv');
const path = require("path");
const express = require("express");
const app = express();
const connection = require('./routes/sqlcontroller');
const nodemailer = require('nodemailer');

dotenv.config({path: './.env'})

app.use('/', require('./routes/pages'));

app.listen(5001, ()=>{
    console.log("started");
});


// const db = mysql.createConnection({
//     host: process.env.DBHOST,
//     user: process.env.DATABASE,
//     password: process.env.DBPASSWORD,
//     database: process.env.DATABASE, 
//     port: 3306, 

// });
// console.log(db);



const publicDirec = path.join(__dirname, './public');
app.use(express.static(publicDirec));

app.use('/auth', require('./routes/auth'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


async function getbydb(command) {
    const [rows] = await connection.query(command);
    console.log(rows);
    return rows;
} 
const studentCol = ["SID", "firstName", "lastName", "class", "classNo", "gender", "dateOfBirth", "email", "password"];

app.post('/register', async (request, response)=>{
    console.log(request.body);
    const {firstname, lastname, email, dob, gender, role, password , confirmPassword} = request.body;
    
    
    if(role == 'student' && (!email.startsWith("s") || email.length != 7)){
        return response.render('register',{
            message: 'invaild email of student'
        });
    }
    else if(password.length < 8){
        return response.render('register',{
            message: 'Password length can not less than 8'
        });

    }
    else if(password !== confirmPassword){
        return response.render('register',{
            message: 'Password do not match'
        });
    }

    cmd = "SELECT email FROM " + role + " WHERE email = " + connection.escape(`${email}@takoi.edu.hk`) + ""

    getbydb(cmd).then(async (results)=>{
        // if(err){
        //     console.log(err);
        // }
        console.log(results);
        if(results.length > 0){
            return response.render('register',{
                message: 'The account is already exist'
            });
        }

        usergmail = `${email}@takoi.edu.hk`;

        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAILACC,
                pass: process.env.GMAILPASS
            }
        });
        let mailDetails = {
            from: process.env.GMAILACC,
            to: usergmail,
            subject: 'Successfully registered!',
            text: `Please check the detail of your account to ensure that there are not any mistake in it. \nSID: ${email}\nName: ${lastname} ${firstname}\nGender: ${gender}\nDate of Birth: ${dob}\nPosition: ${role}\nGmail: ${usergmail} `
        };
         
        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log('Email sent successfully');
            }
        });
        
        const values = [email, firstname, lastname, '5B', 2, gender, dob, usergmail,  password];
        cmd = "INSERT INTO " + role + " (" + studentCol + ") VALUES (" + connection.escape(values) + ")";
        console.log(cmd);
        getbydb(cmd);
        response.send("<h1>Form recieved</h1><br><h2>A confirmed gmail is sent to your gmail. Please check the detail of your account</h2><br><a href='/'><h4>Back to login page<h4></a>");
                
    });


});


app.post('/', async (request, response)=>{
    console.log(request.body);
    const {email, pass , role} = request.body;
    
    
    cmd = "SELECT SID,firstName,lastName,email,password FROM " + role + " WHERE email = " + connection.escape(email) + " AND password = "+ connection.escape(pass) + "";

    getbydb(cmd).then(async (results)=>{
        // if(err){
        //     console.log(err);
        // }
        console.log(results);
        if(results.length == 0){
            return response.render('index',{
                message: 'The email / password is wrong'
            });
        }
        

        // const values = [email, firstname, lastname, '5B', 16, gender, dob, `${email}@takoi.edu.hk`,  password];
        // cmd = "INSERT INTO " + role + " (" + studentCol + ") VALUES (" + connection.escape(values) + ")";
        // console.log(cmd);
        // getbydb(cmd);
        

        cmd = "SELECT * FROM room";
        getbydb(cmd).then((v)=>{
            let text = "";
            for (index in v){
                console.log(v[index])
               text += `<div class="col-6 col-sm-4">
                            <div class="outer">
                                    <a href="/single" class="roomitem">
                                    <img src="itembg.jpg" alt="background image" style="max-width:100%;">
                                        <div class="upper">
                                            <h4>${v[index].name} - ${v[index].floor}/F</h4>
                                            <span><i class="far fa-clock"></i>${v[index].description}</span>
                                        </div>
                                    </a>

                            </div>
                        </div>`;

            }


            // return response.render('booking',{
            //     sid: results[0]['SID'],
            //     firstname: results[0]['firstName'],
            //     lastname: results[0]['lastName'],
            //     email: results[0]['email'],
            //     allroom: text,
            //     // allroomName: v.map(item => connection.escape(item.name)),
            //     // allroomfloor: v.map(item => connection.escape(item.floor)),
            //     // allroomDescrip: v.map(item => connection.escape(item.description)),

            // });
            // response.send(text);
            response.render('booking',{
                sid: results[0]['SID'],
                firstname: results[0]['firstName'],
                lastname: results[0]['lastName'],
                email: results[0]['email'],
                rendered: text,

            });
        });
    
    });


});

function fetchRooms(){
}


app.set('view engine', 'hbs');
