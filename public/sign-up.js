'use strict';

function signUpUser(username, password) {
	var settings = {
	  url: '../users/sign-up',
	  method: 'POST',
	  data: JSON.stringify({username: username, password: password}),
	  contentType: 'application/json',
	  dataType: 'json',
	  error: function(res) {
	  	var message = res.responseJSON.message;
	  	$('.js-message').html(message);
 		}
	};

	$.ajax(settings)
		.done(function (response) {
			$('.js-message').html('Success! Signing in.');
			setTimeout(function(){signInUser(username, password)}, 1000);
		})
}

function createNewDemoUser() {
 signInDemoUser("guest", "guest");
}

function signInUser(username, password) {
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
				location.href = '/myrides/';
			}
			else {
				$('.js-message').html('Server error.');
			}
	});
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
				location.href = '/myrides/';
			}
			else {
				$('.js-message').html('Server error.');
			}
	});

}

function watchDemoClick() {
	$('.js-demo').click(function(event) {

	console.log("Demo clicked ***********")
		event.preventDefault();
//		event.stopPropagation();
        createNewDemoUser();
        event.stopPropagation();
		location.href = '/stationmap/';
	})
	$('.js-howitworks').click(function(event) {

		event.preventDefault();
		event.stopPropagation();
		location.href = '/howitworks/';
	})

	$('.js-explorenyc').click(function(event) {

		event.preventDefault();
		event.stopPropagation();
		location.href = '/explorenyc/';
	})

		$('.js-signup').click(function(event) {

		event.preventDefault();
		event.stopPropagation();
		location.href = '/signup/';
	})

			$('.js-signin').click(function(event) {

		event.preventDefault();
		event.stopPropagation();
		location.href = '/signin/';
	})

    $('.js-my-rides').click(function(event) {

        event.preventDefault();
        event.stopPropagation();
        location.href = '/myrides/';

    })

	
}

function watchSignUp() {
	$('.sign-up-form').submit(function(event) {
		event.preventDefault();
		var username = $('#username').val();
		var password = $('#password').val();
		var passwordConfirm = $('#passwordConfirm').val();
		if (password === passwordConfirm) {
			signUpUser(username, password);
		}
		else {
			$('.js-message').html('"Confirm Password" does not match');
		}

	})
}

$(watchDemoClick());

$(watchSignUp());