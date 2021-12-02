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
    return myDate.toString();
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

//2. OpenWeather API request
async function getCurrentWeather(obj){
    var latitude = obj["lat"];
    var longitude = obj["lon"];
    
    var url = new URL("https://api.openweathermap.org/data/2.5/onecall"),
    params = {lat:latitude,lon:longitude,exclude:"daily,hourly,minutely",appid:'ee21432e35baca622339c5469f528e00'}
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
   
    let response = await fetch(url);
    let data = response.json();
    return data;
}

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

        //trim data get weather data
        result.forEach(function(obj){
            var resultObj={};
            //console.log(obj.timestamp);
            //console.log(convertToHuman(obj.timestamp));

            resultObj["timestamp"] = obj.timestamp;
            resultObj["lat"] = obj.latitude;
            resultObj["lon"] = obj.longitude;
            //console.log(obj);
            
            resultTrimmed.push(resultObj);
            //console.log(resultTrimmed)
        })
        
        //get weather data and append to resultTrimmed
        for(i=0;i<resultTrimmed.length;i++){
            resultTrimmed[i]["weather"] = await getCurrentWeather(resultTrimmed[i]);
        }
        
        console.log(resultTrimmed);
        display(resultTrimmed);

    }else{
        alert("Please Enter Time less than 1 hour ago")
    }
}

function display(resultTrimmed){
    $(document).ready(function(){
        var selectedDateTimeElement = document.getElementById('selectedDateTime');
        var timestamp = resultTrimmed[6]["timestamp"];
        var selectedDateTime = document.createTextNode(convertToHuman(timestamp));

        selectedDateTimeElement.appendChild(selectedDateTime)


        var issDiv = document.getElementById('issDiv');
        issDiv.className ='container';
        var rowDiv = document.createElement('div')
        rowDiv.className ='row';

        for(i=0;i<resultTrimmed.length;i++){

            //div data
            var time = document.createElement('p');
            var dataDiv = document.createElement('div');
            dataDiv.id = `data${i}`;
            dataDiv.className = 'col containD ';
            

            var timestamp = resultTrimmed[i]["timestamp"];
            var timestampText = document.createTextNode(`Timestamps : ${timestamp}`);
            time.appendChild(timestampText);
            time.appendChild(document.createElement("br"));
            time.appendChild(document.createElement("br"));

            var humanDate = convertToHuman(timestamp);
            var humanDateText = document.createTextNode(`Date : ${humanDate}`);
            time.appendChild(humanDateText);
            time.appendChild(document.createElement("br"));
            time.appendChild(document.createElement("br"));

            var latText = document.createTextNode(`Latitude : ${resultTrimmed[i]["lat"]}`);
            time.appendChild(latText);
            time.appendChild(document.createElement("br"));
            time.appendChild(document.createElement("br"));

            var lonText = document.createTextNode(`Longitude : ${resultTrimmed[i]["lon"]}`);
            time.appendChild(lonText);
            time.appendChild(document.createElement("br"));

            dataDiv.appendChild(time);

            //weather div
            var weather = document.createElement('p');
            var weatherDiv = document.createElement('div');
            var weatherHeaderDiv = document.createElement('div');
            weatherHeaderDiv.id='weatherHeader';
            
            var weatherHeaderText = document.createTextNode('Current Weather');
            weather.appendChild(document.createElement("br"));

            weatherHeaderDiv.appendChild(weatherHeaderText);
            dataDiv.appendChild(weatherHeaderDiv);

            var weatherData = {};
            weatherData = resultTrimmed[i]['weather'];
            console.log(weatherData);
            var temp = weatherData['current']['temp']
            var humidity = weatherData['current']['humidity'];
            var sunrise = weatherData['current']['sunrise']
            var sunset = weatherData['current']['sunset']

            var tempText = document.createTextNode(`Temperature : ${temp} ℉`);
            weather.appendChild(tempText);
            weather.appendChild(document.createElement("br"));
            weather.appendChild(document.createElement("br"));

            var humidityText = document.createTextNode(`Humidity : ${humidity}`);
            weather.appendChild(humidityText);
            weather.appendChild(document.createElement("br"));
            weather.appendChild(document.createElement("br"));

            var sunriseHumanDate = convertToHuman(sunrise)
            var sunriseText = document.createTextNode(`Sunrise : ${sunriseHumanDate}`);
            weather.appendChild(sunriseText);
            weather.appendChild(document.createElement("br"));
            weather.appendChild(document.createElement("br"));
           
            var sunsetHumanDate = convertToHuman(sunset)
            var sunsetText = document.createTextNode(`Sunset : ${sunsetHumanDate}`);
            weather.appendChild(sunsetText);
            weather.appendChild(document.createElement("br"));
            weather.appendChild(document.createElement("br"));
           
           
            dataDiv.appendChild(weather);

            //into div rows
            rowDiv.appendChild(dataDiv);
            issDiv.appendChild(rowDiv);
        }
        document.body.appendChild(issDiv);
    })
}
