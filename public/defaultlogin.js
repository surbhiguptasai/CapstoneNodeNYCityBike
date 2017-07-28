var DASH_USER = {};

function updateDASH_USER(fetchedUser) {

    var keys = Object.keys(fetchedUser);

    for (var i = 0; i < keys.length; i++) {
        DASH_USER[keys[i]] = fetchedUser[keys[i]];
    }
    $("#loggedinUser").html('<div class="nav-item" >'+DASH_USER.username+'</div>');

    return DASH_USER;
}

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
            //window.location = response.redirect;
        }
    });
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


$(function(){
    getUser();

});