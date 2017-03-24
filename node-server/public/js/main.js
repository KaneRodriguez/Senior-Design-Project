var y = $(window).height() / 2;
var x = $(window).width() / 2;

var joystickOpts = {
	container	: document.getElementById('container'),
	mouseSupport	: true,
	strokeStyle : '#0f0',
	baseStrokeStyle: 'green',
	limitStickTravel: true,
	stickRadius: 100,
	stationaryBase: true,
	baseX: x,
	baseY: y
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
}, 150);
setInterval(function(){
	joystick._stickInchBackToBase();
}, 1);
	


$("#shutdown").on("click", function() {
		//make the AJAX call (TODO: modal to confirm user request)
    // joystick._changeColors("#f00","#f00");
	this.style.color = "#f00";
	$.ajax({
		url: '/shutdown',
		type: 'POST',
		data: {
		shutdown: true
		}
	});
});

window.addEventListener("load", function() {
	document.getElementById("shutdown").style.color = "#0f0";
});

document.getElementById('slider').addEventListener('input', function() {
	document.body.style.opacity = this.value;
});

$("#invert").on("click", function() {
	$("body").toggleClass("inverted");
	$(this).toggleClass("ion-ios-lightbulb ion-ios-lightbulb-outline");
});

$(document).ready(function(){
 			$("ul.osx-dock li").each(function (type) {
		     	$(this).hover(function () {
		      		$(this).prev("li").addClass("nearby");
		      		$(this).next("li").addClass("nearby");
		     	},
		     	function () {
		      		$(this).prev("li").removeClass("nearby");
		      		$(this).next("li").removeClass("nearby");
		     	});
		    });
		});