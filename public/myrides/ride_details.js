var dataEdited=[];
var data1=[];
var dataToBedisplayed=[];
var queryString = {};
var addUserQueryString = {};
//var baseUrl="http://localhost:8080/";
var myURL="https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
var baseUrl="https://capstonenodenycitybike.herokuapp.com/";
var baseUserUrl=baseUrl+"rides/";
var DASH_USER = {};


function getUser() {
    var settings = {
        url: '../users/me',
        method: 'GET',
        headers: {
            'content-type': 'application/json'
        }
    };

    $.ajax(settings).done(function(response) {

        if (response.user) {

            updateDASH_USER(response.user);
        }
        else {
           createNewDemoUser();
        }
    });
}


function updateDASH_USER(fetchedUser) {

    var keys = Object.keys(fetchedUser);

    for (var i = 0; i < keys.length; i++) {
        DASH_USER[keys[i]] = fetchedUser[keys[i]];
    }

    queryString["userId"]=DASH_USER.username;
    addUserQueryString["userId"]=DASH_USER.username;
    $("#hidden").removeClass('toggle');
    $("#hidden").addClass('show');
    userSubmit();
    getAllRides();
    getDataFromApi(displayStationData);
    $("#loggedinUser").html('<div class="nav-item" >'+DASH_USER.username+'</div>');

    return DASH_USER;
}
function createNewDemoUser() {
    signInDemoUser("guest", "guest");
}
function signInDemoUser(username, password) {
    var settings = {
        url: "../users/login",
        method: "GET",
        headers: {
            'content-type': "application/json",
            authorization: "Basic " + btoa(username + ':' + password)
        }
    };

    $.ajax(settings).done(function (response) {
        if (response.user) {
            updateDASH_USER(response.user);
        }
        else {
            $('.js-message').html('Server error.');
        }
    });
}





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
            resultElement+="<option value='"+station.name+"'>"+station.name+"</option>";
        });
    }
    $('#stationFrom').html(resultElement);
    $('#stationTo').html(resultElement);

}



//var unirest = require('unirest');
function defineBasicTabulatorColumns()
{
    var printIcon = function(cell, formatterParams){

        return "<i class='editabletext'>"+cell+"</i>";
    };

    $("#showResult").tabulator({
        //set height of table (optional)

        fitColumns:true,
        responsiveLayout:true, //fit columns to width of table (optional)
        pagination:"local",
        paginationSize:10,
        addRowPos:"top",
        selectable:true,
        resizableColumns:false,



        columns:[
            {title:"Ride Date", field:"rideDate", sorter:"string",headerFilter:true },
            {title:"Station From", field:"stationFrom", sorter:"string",headerFilter:true,editable:true },
            {title:"Station To", field:"stationTo", sorter:"string",headerFilter:true,editable:true },
            {title:"Cost", field:"cost", sorter:"string",headerFilter:true,formatter:"email",editable:true},

            {title:"Payment Type", field:"paymentType", sorter:"string",headerFilter:true,editable:true },
            {title:"Bike Type", field:"bikeType", sorter:"string",headerFilter:true,editable:true }



        ],
        rowClick:function(e, id, data, row){ //trigger an alert message when the row is clicked
            data1.push(data);
        },
    });

    $("#showResult").tabulator({
        cellEdited:function(id, field, value, oldValue, data, cell, row){
            //id - the id of the row
            //field - field of the cell
            //value - the new value for the cell
            //oldValue - the old value for the cell
            //data - the data for the row
            //cell - the DOM element of the cell
            //row - the DOM element of the row
            dataEdited.push(data);
            cell.addClass('cellEdited');
            $("#save-row").addClass('show1');
        },
    });

}

function setDataReturnedFromAjaxCall()
{
    $("#showResult").tabulator("setData", dataToBedisplayed);
}

function defineDownloadFunctions()
{

    $("#download-csv").click(function(){
        $("#showResult").tabulator("download", "csv", "data.csv");
    });

// //trigger download of data.json file
    $("#download-json").click(function(){
        $("#showResult").tabulator("download", "json", "data.json");
    });
    $("#add-row").click(function(){
        // $("#showResult").tabulator("addRow");


    });
}

function showRideDetails () {
    defineBasicTabulatorColumns();
    setDataReturnedFromAjaxCall();
    defineDownloadFunctions();
}

function makeGetAjaxCall(){


    $.ajax({
        method: "GET",
        url: baseUserUrl,
        contentType:'application/json',  // <---add this
        dataType: 'json',                // <---update this
        data: queryString,
        success: function(result) {
            console.log("results is *****"+result.rides)
            dataToBedisplayed=result.rides;
            showRideDetails();

        },
        error: function(e, ts, et){alert("Error in Retrieving Data"+ts)}
    });

}

function getAllRides() {
    makeGetAjaxCall();

}
function attachSubmitEvent()
{
    $("#userSubmit").click(function(event) {

        handleAddRide();


        $("#hidden").removeClass('toggle');
        $("#hidden").addClass('show');
        // getAllRides();
    });
}
function attachDeleteEvent()
{
    $("#delete-row").click(function(event) {
        if(data1.length==0)
          {
              alert("Please Select Contact by clicking it");

          }
        for(i=0;i<data1.length;i++)
        {

            makeDeleteAjaxCall();

        }
         if(data1.length!=0)
          alert("Contact Deleted Successfully!!");
        data1=[];
    });

}

function attachSaveUserEvent()
{
    $("#save-row").click(function(event) {
        for(i=0;i<dataEdited.length;i++)
        {

            makePutAjaxCall(dataEdited[i]);
        }
        alert("Contact Saved Successfully!!");
        dataEdited=[];
    });


}
function makeDeleteAjaxCall()
{
    var url1=baseUserUrl;
    var id=data1[i].id;
    url1=url1+id;


    $.ajax({
        url: url1,
        type: 'DELETE',//<-----this should have to be an object.
        contentType:'application/json',
        data: JSON.stringify(queryString),
        success: function(result) {
            handleSuccessfulDeleteEvent(id);
        },
        error: function(result){alert("Deleted Error  ")}
    });

}

function makePutAjaxCall(data1)
{

    var url1=baseUserUrl;
    var id=dataEdited[i].id;

    url1=url1+id;
    data1["userId"]=DASH_USER.username;

    $.ajax({
        url: url1,
        type: 'PUT',//<-----this should have to be an object.
        contentType:'application/json',  // <---add this
        data: JSON.stringify(data1),
        // <---update this
        success: function(result) {

            getAllRides();
        },
        //error: function(result){alert("PUT Error  ")}
        error: function(e, ts, et){alert("Error in Putting Data"+ts)}
    });

}

function handleSuccessfulDeleteEvent(id)
{
    for(i=0;i<dataToBedisplayed.length;i++)
    {
        if(id  == dataToBedisplayed[i].id)
        {
            dataToBedisplayed.splice(i, 1);
            showRideDetails();
            break;
        }
    }

}

function userSubmit() {

    attachSubmitEvent();
    attachDeleteEvent();
    attachSaveUserEvent();
}
function handleAddRide()
{
    var rideDate=$("#rideDate").val();
    var stationFrom=$("#stationFrom").val();
    var stationTo=$("#stationTo").val();
    var cost=$("#cost").val();
    var paymentType=$("#paymentType").val();
    var bikeType=$("#bikeType").val();

    if(rideDate != undefined && rideDate != null && rideDate.length > 0)
        addUserQueryString ["rideDate"] = rideDate;
    if(stationFrom != undefined && stationFrom != null && stationFrom.length > 0)
        addUserQueryString ["stationFrom"] = stationFrom;
    if(stationTo != undefined && stationTo != null && stationTo.length > 0)
        addUserQueryString ["stationTo"] = stationTo;
    if(cost != undefined && cost != null && cost.length > 0)
        addUserQueryString ["cost"] = cost;
    if(paymentType != undefined && paymentType != null && paymentType.length > 0)
        addUserQueryString ["paymentType"] = paymentType;
    if(bikeType != undefined && bikeType != null && bikeType.length > 0)
        addUserQueryString ["bikeType"] = bikeType;

    makePostAjaxCall();
    closePopUp();
}

function makePostAjaxCall(){
    $.ajax({
        method: "POST",
        url: baseUserUrl+"add/",
        contentType:'application/json',  // <---add this
        dataType: 'text',                // <---update this
        data: JSON.stringify(addUserQueryString),
        success: function(result) {

            getAllRides();

        },
        error: function(e, ts, et){
            alert("Error in Posting Data"+JSON.stringify(e) );
        }
    });

}
function closePopUp(){
    document.getElementById('id01').style.display='none';
}
$(function(){
    getUser();
});

