const { text } = require("express");
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

router.get('/allroom', function (req, res) {
    cmd = "SELECT * FROM room";
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