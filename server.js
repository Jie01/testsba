const mysql = require("mysql2/promise");
const dotenv = require('dotenv');
const path = require("path");
const express = require("express");
const app = express();
const connectFunc = require('./routes/sqlcontroller');
const nodemailer = require('nodemailer');
var functions = require("./routes/kglobal.js");


dotenv.config({path: './.env'})

app.use('/', require('./routes/pages'));

app.listen(5001, ()=>{
    console.log("started");
});


const publicDirec = path.join(__dirname, './public');
app.use(express.static(publicDirec));

app.use('/auth', require('./routes/auth'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());


const studentCol = ["SID", "firstName", "lastName", "class", "classNo", "gender", "dateOfBirth", "email", "password"];
const teacherCol = ["TID", "firstName", "lastName", "gender", "dateOfBirth", "email", "password",]

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
    let values = [];
    let confirmText = "";
    const usergmail = `${email}@takoi.edu.hk`;

    switch (role){
        case "student":
            values = [email, firstname, lastname, '5B', 2, gender, dob, usergmail,  password];
            confirmText = `Please check the detail of your account to ensure that there are not any mistake in it. \nSID: ${email}\nName: ${firstname} ${lastname}\nGender: ${gender}\nDate of Birth: ${dob}\nPosition: ${role}\nGmail: ${usergmail} `;
            registerinDB(role, studentCol, values, usergmail, confirmText, response)
            break;
        case "teacher":
            functions.getbydb('SELECT generate_tid()').then((v)=>{
                const tid = v[0]['generate_tid()'];
                console.log(tid);
                values = [tid, firstname, lastname, gender, dob, usergmail,  password];
                confirmText = `Please check the detail of your account to ensure that there are not any mistake in it. \nTID: ${email}\nName: ${firstname} ${lastname}\nGender: ${gender}\nDate of Birth: ${dob}\nPosition: ${role}\nGmail: ${usergmail} `;
                registerinDB(role, teacherCol, values, usergmail, confirmText, response)

            });
            
            break;
        case "staff":
            break;
    }

    


});


app.post('/', async (request, response)=>{
    console.log(request.body);
    const {email, pass , role} = request.body;
    
    
    cmd = "SELECT * FROM " + role + " WHERE email = " + connectFunc.text2sql(email) + " AND password = "+ connectFunc.text2sql(pass) + "";

    functions.getbydb(cmd).then(async (results)=>{
        // if(err){
        //     console.log(err);
        // }
        console.log(results);
        if(results.length == 0){
            return response.render('index',{
                message: 'The email / password is wrong'
            });
        }
        

        datas = Object.values(results[0]);
        global.userdata = [role, datas[0], datas[1], datas[2],datas.at(-4), datas.at(-2)];
        response.redirect("/allroom");
    });


});


bookcol = ['bookingID', 'bpID', 'TID','RID', 'booktime', 'useDate', 'starttime', 'endtime', 'numOfppl', 'CID', 'detail']
app.post('/booking', bookingHandler, homeCtrl)

function homeCtrl(req, res) {

    // Prepare the context
    var context = req.dataProcessed;
    console.log(context);
    res.render('booking', context);
}


function bookingHandler(req, res, next){
    const text = `${req.url}`;
    const rid = text.toString().substring(text.length-4)

    const {id, teacherInCharge, bookdate, starttime, endtime, numOfPeople, bookCate, cateDetail} = req.body;
    console.log(req.body);

    cmd = "SELECT * FROM bookingInfo WHERE RID=" + connectFunc.text2sql(rid) + " AND useDate="+ connectFunc.text2sql(bookdate) +"";
    functions.getbydb(cmd).then((v)=>{
        if(v.length ==0 ){
            // OK for all time
            const nowtime = new Date();
            console.log(nowtime)
            values = [null, id, teacherInCharge, rid,nowtime, bookdate, starttime, endtime, numOfPeople, bookCate, cateDetail];
            submitBookForm(values, res);
        }
        else {
            for(index in v){
                 
                console.log(v);

                // time of first timespan

                vdate = v[index].useDate.toLocaleDateString();
                console.log(vdate);
                var x = new Date(`${vdate} ${v[index].starttime}`).getTime();
                var y = new Date(`${vdate} ${v[index].endtime}`).getTime();

                // time of second timespan
                var a = new Date(`${bookdate} ${starttime}`).getTime();
                var b = new Date(`${bookdate} ${endtime}`).getTime();

                if (Math.min(x, y) <= Math.max(a, b) && Math.max(x, y) >= Math.min(a, b)) {
                    console.log(global.bookingFormData);
                    global.bookingFormData['message'] = "The room is booked at this period of time";
                
                    req.dataProcessed = global.bookingFormData;
                    return next();
                    
                }
                
            }
            const nowtime = new Date();
            console.log(nowtime)
            values = [null, id, teacherInCharge, rid,nowtime, bookdate, starttime, endtime, numOfPeople, bookCate, cateDetail];
            
            switch (global.userdata[0]){
                case "student":
                    cmd = "SELECT firstName, lastName, gender, email FROM teacher WHERE TID=" + connectFunc.text2sql(teacherInCharge) +"";
                    functions.getbydb(cmd).then((v)=>{
                        
                        confirmText = `Hi ${global.userdata[2]} ${global.userdata[3]}, \nWe recieved your booking for RoomID: ${rid} at ${bookdate} from ${starttime} to ${endtime}. For ${cateDetail}. \nWe will send the booking information and appointment note to ${v[0].gender== 'F' ? 'Ms' : 'Mr'} ${v[0].firstName} ${v[0].lastName} as soon as possible.`;
                        sendgmail(global.userdata[5], "Successfully book the room", confirmText);
                        confirmText = `Hi ${v[0].gender== 'F' ? 'Ms' : 'Mr'} ${v[0].firstName} ${v[0].lastName}, \nWe recieved your student ${global.userdata[1]} - ${global.userdata[2]} ${global.userdata[3]} for booking room: ${rid} at ${bookdate} from ${starttime} to ${endtime}. For ${cateDetail}. \nWe will send appointment note to you as soon as possible.`;
                        sendgmail(global.userdata[5], "Successfully book the room by student", confirmText);

                    })
                    break;
                case "teacher":
                    confirmText = `Hi ${global.userdata[4] == 'F' ? 'Ms' : 'Mr'} ${global.userdata[2]} ${global.userdata[3]}, \nWe recieved your booking for RoomID: ${rid} at ${bookdate} from ${starttime} to ${endtime}. For ${cateDetail}. \nWe will send appointment note to you as soon as possible.`;
                    sendgmail(global.userdata[5], "Successfully book the room", confirmText);

                    break;
            }

            submitBookForm(values, res);
        }

    });

}

function submitBookForm(values, res){

    

    cmd = "INSERT INTO bookingInfo (" + bookcol + ") VALUES (" + connectFunc.text2sql(values) + ")";
    console.log(cmd);
    functions.getbydb(cmd);
    res.send("<h1>Booking request recieved</h1><br><h2>A confirmed gmail is sent to you and the teacher in charge. Please check the detail of your booking </h2><br><a href='/allroom'><h4>Back to Home page<h4></a>");

}

function registerinDB(role, col, values,gmail, confirmText, res){


    cmd = "SELECT email FROM " + role + " WHERE email = " + connectFunc.text2sql(gmail) + ""

    functions.getbydb(cmd).then(async (results)=>{



        console.log(results);
        if(results.length > 0){
            return res.render('register',{
                message: 'The account is already exist'
            });
        }


        sendgmail(gmail, 'Successfully registered!', confirmText);

        cmd = "INSERT INTO " + role + " (" + col + ") VALUES (" + connectFunc.text2sql(values) + ")";
        console.log(cmd);
        functions.getbydb(cmd);
        res.send("<h1>Form recieved</h1><br><h2>A confirmed gmail is sent to your gmail. Please check the detail of your account</h2><br><a href='/'><h4>Back to login page<h4></a>");
                
    });


}


function sendgmail(reciever, subject, innerText){
    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAILACC,
            pass: process.env.GMAILPASS
        }
    });
    let mailDetails = {
        from: process.env.GMAILACC,
        to: reciever,
        subject: subject,
        text: innerText
    };
     
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            console.log('Email sent successfully');
        }
    });
    
}


app.set('view engine', 'hbs');
