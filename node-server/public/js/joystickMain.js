/* basic joystick stuff that we want immediately upon load */

var beginY = $(window).height() / 2;
var beginX = $(window).width() / 2;

var joystickOpts = {
	container	: document.getElementById('container'),
	mouseSupport	: true,
	strokeStyle : '#0f0',
	baseStrokeStyle: 'green',
	limitStickTravel: true,
	stickRadius: 50,
	stationaryBase: true,
	baseX: beginX,
	baseY: beginY,
	colorsMatchTrackSpeed: true,
	stickAnimateBackToBase: true,
	stickAnimateToLocation: true
};

var joystick	= new VirtualJoystick(joystickOpts);

// handle resizing of the window
$(window).resize(function() {
	joystick._baseX = $(window).width() / 2;
	joystick._baseY = $(window).height() / 2;
	joystick._resetStationaryBase();
});

setInterval(function(){
	joystick._updateTracks();
}, 175);
setInterval(function(){
	joystick._stickInchBackToBase();
	joystick._stickInchToLocation(joystick._targetX, joystick._targetY);
}, 50);

$(document).ready(function() {
	$('#increase_joystick').on('mousedown touchstart', function() {
		interval = setInterval(function() {
			joystickRadChange('increase');
		}, 150);
	}).on('mouseup mouseleave touchend', function() {
		clearInterval(interval);
	});

	$('#decrease_joystick').on('mousedown touchstart', function() {
		interval = setInterval(function() {
			joystickRadChange('decrease');
		}, 150);
	}).on('mouseup mouseleave touchend', function() {
		clearInterval(interval);
	});

	function joystickRadChange(commandType) {
		var step = 3;
		
		if( commandType == 'increase' ) {
			joystick._stickRadius = joystick._stickRadius + step;
		} else if ( commandType == 'decrease' ) {
			joystick._stickRadius = joystick._stickRadius - step;
		}
		
		if ( joystick._stickRadius < 1 ) {
			joystick._stickRadius = 1;
		} 
	}
});