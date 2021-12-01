//global variable
var result;
var resultTrimmed = [];
var resultObj = {};

//1. Fetch and display ISS Location (WheretheISS API)
// Check time less than hours
function checkDate(date){
    //current datetime
    var now = new Date();

    //given datetime minus current (miliseconds)
    var diff = now - date;

    //diff in minutes
    var inMin = Math.floor(diff/1000/60);
    //console.log(inMin);

    return inMin;
}

// Calculate multiple time
function genTimeArray(date){
    var date = new Date(date);

    //looping minus
    //1 second = 1,000 miliseconds
    //1 minutes = 60,000 miliseconds
    //10 minutes = 600,000 miliseconds
    var ms_per_10min = 600000;

    // array to store all time
    var timeArray = [];

    //previous 1 hour interval time in 10 minutes
    var mydate = date;
    for(i=5; i>=0; i--){
        mydate = mydate - ms_per_10min;
        var mydate = new Date(mydate);
        //store in array
        timeArray[i] = mydate;
        //console.log(mydate.toLocaleString()) 
    }

    //var date = new Date(date)
    //console.log(date.toLocaleString());

    //store original datetime
    timeArray[6] = date;
    
    //next 1 hour interval time in 10 minutes
    var mydate2 = date;
    for(i=7; i<13; i++){

        //mydate2 = mydate2 + ms_per_10min;
        var mydate2 = new Date(mydate2);
        mydate2.setMinutes(mydate2.getMinutes()+10);
        //store in array
        timeArray[i] = mydate2;
        //console.log(mydate.toLocaleString()) 
    }
    
    //console.log(timeArray);
    return timeArray;
}

// Convert datetime to timestamp
function convertToEpoch(date){
    //getTime()  returns the number of milliseconds since January 1, 1970.
    var epoch = date.getTime()/1000.0;
    return epoch;
};

//convert timestamp to Human
function convertToHuman(timestamp){
    var myDate = new Date(timestamp*1000);
    return myDate.toLocaleString();
}

//API request
async function get_ISS(timestamp){
    
    var url = new URL('https://api.wheretheiss.at/v1/satellites/25544/positions'),
    params = {timestamps:timestamp}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    
    /*fetch(url)
        .then(response =>{return response.json()})
        .then(data=>console.log(data));
    */
    
    let response = await fetch(url);
    let data = response.json();
    return data;
};

//Submit onclick function 
async function submit(){
    //console.log(document.getElementById('datetime').value);
    
    //fetch value inserted by user
    var myDate = new Date (document.getElementById('datetime').value);

    //check timestamp less than 1 hour, if not, run the rest of function
    var timeReq = checkDate(myDate);
    //console.log(timeReq);

    if(timeReq>=0 && timeReq>=60){
        // generate datetime date 
        var DateArray= [];
        DateArray = genTimeArray(myDate); 
        //console.log(DateArray);
        
        //timestamps array
        var timestampArr = [];
        for(i=0; i<DateArray.length;i++){
            var timestamp = convertToEpoch(DateArray[i]);
            timestampArr[i]=timestamp;
        }
        //console.log(timestampArr);
        // Convert datetime to timestamp
        //var timestamp = convertToEpoch(myDate);
        //console.log(timestamp)
        
        //fetch time location of the ISS
        let params_time = timestampArr.join(); //return array as string
        result = await get_ISS(params_time);
        console.log(result);

        //trim data 
        result.forEach(function(obj){
            console.log(obj.timestamp);
            console.log(convertToHuman(obj.timestamp));
            var timestamp = obj.timestamp;
            var latitude = obj.latitude;
            var longitude = obj.longitude;
        })


    }else{
        alert("Please Enter Time less than 1 hour ago")
    }

}


