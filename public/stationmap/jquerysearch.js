var myURL="https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
var stationResultUrl="https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
var stationId=0;
var stations=[];
var stationsMap;
var stationResults=[];
var stationResultsMap;
var stationsMapConstructed=false;
var stationResultsMapConstructed=false;
var numOfMarkerToDisplayCount=20;
var labelFlag="Bike";
var latlng="";
var selectedStationLatitude="";
var selectedStationLongitude="";



function getDataFromApi(callback) {


  var query = {
  }
  jQuery.support.cors = true;
  //$.getJSON(myURL, query, callback);


  $.ajax({
   url: myURL,
    cors: true ,
   contentType:'application/json',
   crossDomain:true,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
    
   success: function(data) {
   

    displayStationData(data);
   },
   type: 'GET'
});

}

function displayStationData(results) {
  var resultElement = '';
  stations=results.data.stations;
  stationsMap = new Map(stations.map((station) => [station.station_id, station]));
//   for (var [key, value] of stationsMap) {
//   console.log(key + ' = ' + value.name);
// }
//   alert("Station Map "+stationsMap.get("72").name);
  if (results.data.stations) {
   resultElement+="<option value=''>Select Station</option>";
   results.data.stations.forEach(function(station) {
      resultElement+="<option value='"+station.station_id+"'>"+station.name+"</option>";
    });
  }
  $('.stationList').html(resultElement);
  stationsMapConstructed=true;
  getStationResultFromApi(displayStationResults);
}


function getStationResultFromApi(callback)
{

 var query = {

  }
  $.getJSON(stationResultUrl, query, callback);
}
function displayStationResults(results)
{
  stationResults=results.data.stations;
  stationResultsMap= new Map(stationResults.map((stationResult) => [stationResult.station_id, stationResult]));
//     for (var [key, value] of stationResultsMap) {
//   console.log(key + ' = ' + value.num_bikes_available);
// }
// //   alert("Station Map "+stationsMap.get("72").name);
stationResultsMapConstructed=true;
 createMap();
}

function showStationResults(){
        var stationDetails=stationsMap.get(stationId);
        var stationResult=stationResultsMap.get(stationId);
        var displayResultHtml="<h2>Station Selected: "+stationDetails.name+"</h2>";
        displayResultHtml+="<br>";
        displayResultHtml+="<p>Total Number of bikes available:  "+stationResult.num_bikes_available+"</p>";
        displayResultHtml+="<br>";
        displayResultHtml+="<p>Total Number of Docks available:  "+stationResult.num_docks_available+"</p>";
        $(".js-search-results").html(displayResultHtml);
     
}


function userSubmit() {
  getDataFromApi( displayStationData);
  


  // var createMapFlag=true;
  // while(createMapFlag)
  // {

  // if( stationsMapConstructed && stationResultsMapConstructed)
  // {
  // createMap();
  // createMapFlag=false;
//   }
// }

  $('.stationList').change(function(){
    stationId=$(this).val();
    var stationDetails=stationsMap.get(stationId);
    selectedStationLatitude=stationDetails.lat;
    selectedStationLongitude=stationDetails.lon;

    latlng = new google.maps.LatLng(selectedStationLatitude, selectedStationLongitude);
    createMap();
    showStationResults();

   
    
    //geolocationSuccess(latitude,longitude);
     
});

   $('.pinsDropDown').change(function(){
    count=$(this).val();
    if(count=="All")
    {
      
      numOfMarkerToDisplayCount=stations.length;
    }
     else
      numOfMarkerToDisplayCount=count;

    createMap();
   
    
    //geolocationSuccess(latitude,longitude);
     
});

}

// This function will iterate over markersData array
// creating markers with createMarker function
function displayMarkers(){

   // this variable sets the map bounds and zoom level according to markers position
   var bounds = new google.maps.LatLngBounds();
   

   if(stationId!=0)
   {
    var stationDetails=stationsMap.get(stationId);
    latlng = new google.maps.LatLng(stationDetails.lat, stationDetails.lon);
    var currStationId = stationId;
    var color="blue";


      var name = stationDetails.name;
      var numBikesAvailable = stationResultsMap.get(currStationId).num_bikes_available;
      var numDocksAvailable = stationResultsMap.get(currStationId).num_docks_available;
      var label="";
      if(labelFlag=="Bike")
        label=numBikesAvailable+"";
      else if(labelFlag=="Dock")
        label=numDocksAvailable+"";
      

      createMarker(latlng, name, numBikesAvailable, numDocksAvailable,label,color);
      
      // Marker’s Lat. and Lng. values are added to bounds variable
      bounds.extend(latlng); 
   }
   //var newIcon = MapIconMaker.createMarkerIcon({width: 20, height: 34, primaryColor: "#0000FF", cornercolor:"#0000FF"});
    var count=0; 
   // For loop that runs through the info on markersData making it possible to createMarker function to create the markers
   for (var i = 0; (i < stations.length) && (count < numOfMarkerToDisplayCount); i++){

      color="red";
      var latlng = new google.maps.LatLng(stations[i].lat, stations[i].lon);
      var currStationId = stations[i].station_id;
      if(currStationId !=stationId)
      {
      var name = stations[i].name;
      var numBikesAvailable = stationResultsMap.get(currStationId).num_bikes_available;
      var numDocksAvailable = stationResultsMap.get(currStationId).num_docks_available;
      var label="";
        if(labelFlag=="Bike")
        label=numBikesAvailable+"";
      else if(labelFlag=="Dock")
        label=numDocksAvailable+"";
      

      createMarker(latlng, name, numBikesAvailable, numDocksAvailable,label,color);
      
      // Marker’s Lat. and Lng. values are added to bounds variable
      bounds.extend(latlng); 
      }

      count ++;
      
   }

   // Finally the bounds variable is used to set the map bounds
   // with API’s fitBounds() function
   map.fitBounds(bounds);
}

// This function creates each marker and sets their Info Window content
function createMarker(latlng, name, numBikesAvailable, numDocksAvailable,label,color){
    // var pinColor = "FE7569";
    // var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    //     new google.maps.Size(21, 34),
    //     new google.maps.Point(0,0),
    //     new google.maps.Point(10, 34));
    var url = "";
    url = "http://maps.google.com/mapfiles/ms/icons/" + color + ".png";

     var image = {
        url: url, // image is 512 x 512
        scaledSize : new google.maps.Size(50, 50),
    };

   var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      label:label,
      title: name,
      animation: google.maps.Animation.DROP,
      icon: image
      
   });

   // This event expects a click on a marker
   // When this event is fired the infowindow content is created
   // and the infowindow is opened
   google.maps.event.addListener(marker, 'click', function() {
      
      // Variable to define the HTML content to be inserted in the infowindow
      var iwContent = '<div id="iw_container">' +
      '<div class="iw_title">' + name + '</div>' +
      '<div class="iw_content"> Bikes: ' + numBikesAvailable + '<br />' +"Docks: "+
      numDocksAvailable + '</div></div>';
      
      // including content to the infowindow
      infoWindow.setContent(iwContent);

      // opening the infowindow in the current map and at the current marker location
      infoWindow.open(map, marker);
   });
}

function createMap() {
  if(latlng!="")
  {
      var mapOptions = {
      center: new google.maps.LatLng(selectedStationLatitude,selectedStationLongitude),
      zoom: 9,
      radius:1000,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
   };
   map = new google.maps.Map(document.getElementById('map'), mapOptions);
   var circle = new google.maps.Circle({
    center: latlng,
    radius: 1000,
    map: map,

    strokeColor: 'grey',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: 'grey',
            fillOpacity: 0.8,
});
  }
  else
  {
    var mapOptions = {
      
      zoom: 9,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
   };
   map = new google.maps.Map(document.getElementById('map'), mapOptions);
  }
 

   

   // a new Info Window is created
   infoWindow = new google.maps.InfoWindow();

   // Event that closes the InfoWindow with a click on the map
   google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
   });

var bikecolor="white";
var dockcolor="white";
      if(labelFlag=="Bike")
        bikecolor="grey";
      else if(labelFlag=="Dock")
        dockcolor="grey";

          var centerControlDiv = document.createElement('div');
        var centerControl = new BikeControl(centerControlDiv, map,bikecolor);

        centerControlDiv.index = 1;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

         var dockControlDiv = document.createElement('div');
        var dockControl = new DockControl(dockControlDiv, map,dockcolor);

        dockControl.index = 1;
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(dockControlDiv);


   // Finally displayMarkers() function is called to begin the markers creation
   displayMarkers();
}

// function geolocationSuccess(latitude,longitude) {
//         var userLatLng = new google.maps.LatLng(latitude, longitude);
//         var label1=stationResultsMap.get(stationId).num_bikes_available+"";
//         // Write the formatted address
//         // writeAddressName(userLatLng);
//
//         var myOptions = {
//           zoom : 16,
//           center : userLatLng,
//           mapTypeId : google.maps.MapTypeId.ROADMAP
//         };
//         // Draw the map
//         var mapObject = new google.maps.Map(document.getElementById("map"), myOptions);
//         // Place the marker
//         new google.maps.Marker({
//           map: mapObject,
//           label:label1,
//           position: userLatLng
//         });
//         // Draw a circle around the user position to have an idea of the current localization accuracy
//         var circle = new google.maps.Circle({
//           center: userLatLng,
//           map: mapObject,
//           fillColor: '#0000FF',
//           fillOpacity: 0.5,
//           strokeColor: '#0000FF',
//           strokeOpacity: 1.0
//         });
//         mapObject.fitBounds(circle.getBounds());
//       }

      function BikeControl(controlDiv, map,color) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = color;
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '1px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Bike Count';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          labelFlag="Bike";
          createMap();
        });

      }


      function DockControl(controlDiv, map,color) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = color;
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Dock Count';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          
          labelFlag="Dock";
          createMap();
        });

      }

$(function(){
	userSubmit();
});