var beginY = $(window).height() / 2;
var beginX = $(window).width() / 2;

var joystickOpts = {
	container	: document.getElementById('container'),
	mouseSupport	: true,
	strokeStyle : '#0f0',
	baseStrokeStyle: 'green',
	limitStickTravel: true,
	stickRadius: 100,
	stationaryBase: true,
	baseX: beginX,
	baseY: beginY
};

var joystick	= new VirtualJoystick(joystickOpts);

window.addEventListener("load", function() {
	document.getElementById("shutdown_fake").style.color = "#0f0";
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
setInterval(function(){
	
	joystick._stickInchBackToBase();
}, 1);

document.getElementById('slider').addEventListener('input', function() {
	document.body.style.opacity = this.value;
});

$("#invert").on("click", function() {
	$("body").toggleClass("inverted");
	$(this).toggleClass("ion-ios-lightbulb ion-ios-lightbulb-outline");
});

window.setTimeout(function(event) {document.getElementById('shutdown_real').addEventListener('click', function (e) {
	console.log(e);
    joystick._changeColors("#f00","#f00");
	document.getElementById('shutdown_fake').style.color = "#f00";
	$.ajax({
		url: '/shutdown',
		type: 'POST',
		data: {
		shutdown: true
		}
	});
}, false) }, 2000);
$(document).on("click", function(e){console.log(e)});
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