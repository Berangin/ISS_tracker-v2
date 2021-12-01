function initMap(){
    var mymap = L.map('map').setView([28.612, 77.229], 4);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);
}   
    
