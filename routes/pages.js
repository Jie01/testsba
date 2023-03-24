
const express = require("express");
const router = express.Router();
var functions = require("./kglobal.js");
// const connection = require('./sqlcontroller');
var roommodel = require('./rmodel.js');



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
    const cmd = "SELECT * FROM room WHERE RID = '"+id+"'";
    functions.getbydb(cmd).then((v)=>{
        roommodel.initModel(v[0]);
        res.render('single', {
            RID: v[0].RID,
            name: v[0].name,
            floor: v[0].floor,
            description: v[0].description,
            timelimit: v[0].timelimit,
            peoplelimit: v[0].peoplelimit,
            studentAvailable: v[0].studentAvailable == 0? 'No': 'Yes', 
        });
    });
});

router.get('/timetable', function (req, res) {
    getroom = roommodel.getdata();

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    
    const nowdate = yyyy + '-' + mm + '-' + dd;
    
    const cmd = "SELECT bpID, useDate, starttime, endtime FROM bookingInfo WHERE RID = '"+getroom.RID+"' AND useDate >= '" + nowdate + "' ORDER BY useDate";
    console.log(cmd);
    let text = "";
    functions.getbydb(cmd).then((v)=>{
        for (let index=0; index< v.length; index++){

            text += `<p class='lead'>${v[index].useDate.toLocaleDateString()} : ${v[index].starttime} - ${v[index].endtime} is booked</p>`;
            if(index <= v.length-2){

                if(v[index].useDate.getTime() != v[index+1].useDate.getTime()){
                    text += '<hr>';
                }
            }
        }
        res.render('timetable', {
            allusedTime: text,
        });
    });
});

router.get('/allroom', function (req, res) {

    switch (global.userdata[0]){
        case 'student':
            cmd = "SELECT * FROM room WHERE studentAvailable = 1";
            break;
        case 'teacher':
            cmd = "SELECT * FROM room";

    }

    functions.getbydb(cmd).then((v)=>{
        let text = "";
        for (index in v){
            console.log(v[index])
           text += `<div class="col-6 col-sm-4">
                        <div class="outer">
                                <a href="/single?${v[index].RID}" class="roomitem">
                                <img src="itembg.jpg" alt="background image" style="max-width:100%;">
                                    <div class="upper">
                                        <h4>${v[index].name} - ${v[index].floor}/F</h4>
                                        <span><i class="far fa-clock"></i>${v[index].description}</span>
                                    </div>
                                </a>

                        </div>
                    </div>`;

        }

        res.render('allroom',{
            sid: global.userdata[1],
            firstname: global.userdata[2],
            lastname: global.userdata[3],
            email: global.userdata[5],
            rendered: text,

        });
    });

});

router.get('/booking', function (req, res) {
    console.log("USER "+ global.userdata);
    functions.getcate().then((v)=>{
        
        let cate = "";
        for (index in v){
            cate += `<option value="${v[index].CID}">${v[index].name}</option>`;

        }
        const ceteoption = `<select name="bookCate" class='form-select' aria-label='Default select example' required><option selected disabled value>Select the category of usage</option> ${cate} </select>` 
        getroom = roommodel.getdata();
        console.log(getroom);

        functions.getTeachers().then((t)=>{
            let teachers = "";
            for (index in t){
                console.log()
                teachers += `<option value="${t[index].TID}">${t[index].gender == 'F'? 'Ms': 'Mr'} ${t[index].firstName} ${t[index].lastName}</option>`;
            }
            const teachoption = `<select name="teacherInCharge" class='form-select' aria-label='Default select example' required><option selected disabled value>Select the teacher in charge</option> ${teachers} </select>` 
            
            global.bookingFormData = {
                usage: ceteoption,
                teachers: teachoption,
                roomid: getroom.RID,
                roomname: getroom.name,
                roomAvailable: getroom.studentAvailable == 0? 'No': 'Yes',
                maxPeople: `${getroom.peoplelimit}`,
                isstudent: global.userdata[0] == 'student',
                isteacher: global.userdata[0] == 'teacher',
                SID: global.userdata[1],
            };
            console.log(global.bookingFormData);
            res.render('booking', global.bookingFormData);

        })

    })

});


module.exports = router;