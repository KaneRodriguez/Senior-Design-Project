
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

setInterval(function(){
	joystick._updateTracks();
}, 1000);

 
