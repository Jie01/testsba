class Kroom{ 	
    constructor(){
        this.roomdata = null;
    }

    initModel (data) {
        this.roomdata = data;
    }

    getdata () { return this.roomdata;}

    setdata (data) { this.roomdata = data; }


}


module.exports = new Kroom();



