
var y = $(window).height() / 2;
var x = $(window).width() / 2;

var joystick	= new VirtualJoystick({
	container	: document.getElementById('container'),
	mouseSupport	: true,
	strokeStyle : 'blue',
	baseStrokeStyle: 'red',
	limitStickTravel: true,
	stickRadius: 100,
	stationaryBase: true,
	baseX: x,
	baseY: y
});

// handle resizing of the window
$(window).resize(function() {
	joystick._baseX = $(window).width() / 2;
	joystick._baseY = $(window).height() / 2;
	joystick._resetStationaryBase();
});

setInterval(function(){
	joystick._updateTracks();
}, 150);

$("#shutdown").on("click", function() {
		//make the AJAX call (TODO: modal to confirm user request)
	this.style.color = '#f00';
	$.ajax({
		url: '/shutdown',
		type: 'POST',
		data: {
		shutdown: true
		}
	});
});
