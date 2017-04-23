/******* Video Stuff ****/

// Show loading notice
		var videoCanvas = document.getElementById('videoCanvas');
		var ctx = videoCanvas.getContext('2d');
		ctx.fillStyle = '#444';
		ctx.fillText('Loading...', videoCanvas.width/2-30, videoCanvas.height/3);




		// Setup the WebSocket connection and start the player
		var client = new WebSocket('ws://doesitreallymatter.com:8084/');
		var player = new jsmpeg(client, {canvas:videoCanvas});

		

/******* End Video Stuff ****/


var closemodal = false;

window.addEventListener("load", function() {
	document.getElementById("shutdown_fake").style.color = "#0f0";
});


$("#invert").on("click", function() {
	$("body").toggleClass("inverted");
	$(this).toggleClass("ion-ios-lightbulb ion-ios-lightbulb-outline");
});
	
window.setTimeout(function(event) {document.getElementById('shutdown_real').addEventListener('click', function (e) {
joystick.changeBaseColors(5, 6);

	document.getElementById('shutdown_fake').style.color = "#f00";
	$.ajax({
		url: '/shutdown',
		type: 'POST',
		data: {
		shutdown: true
		}
	});
}, false) }, 2000);
$(".osx-dock li a:not(#invert)").on("click touchstart touchend", function() {
	if (!$(this).is("#home,#steering")) {
		$("#stickCanvas,#innerCanvas").hide();
	} else {
		$("#stickCanvas,#innerCanvas").show();
	}
	if (!$(this).is("#home,#camera")) {
		$("#videoCanvas").hide();
	} else {
		if ($(this).is("#camera")) {
			$("#videoCanvas").css("width", "80%");
			$("#videoCanvas").css("height", "60%");
		}
		else if ($(this).is("#home")) {
			$("#videoCanvas").css("width", "320px");
			$("#videoCanvas").css("height", "240px");
		}
		$("#videoCanvas").show();
	}
	$(".active_action").hide();
	$(".active_action").removeClass("active_action");
	$(".active").removeClass("active");
	$("#" + $(this).attr("id") + "_action").show();
	$("#" + $(this).attr("id") + "_action").addClass("active_action");
	$(this).addClass("active");
});
$(document).ready(function() {
	$(".actions").hide();
	$("ul.osx-dock li").each(function (type) {
		$(this).hover(function () {
			$(this).prev("li").addClass("nearby");
			$(this).next("li").addClass("nearby");
		},
		function () {
			$(this).prev("li").removeClass("nearby");
			$(this).next("li").removeClass("nearby");
		});
		$(this).click(function() {
			$(".active").removeClass("active");
			$(this).addClass("active")
		});
	});
});
$("#shutdown_fake").on("click", function() {
	closemodal = true;
});

$(".close").on("click", function() {
	if (closemodal) {
		$("#modalDialog").hide();
		closemodal = false;
	}
});

$("#bg_color").on("input", function() {
	document.body.style.backgroundColor = $(this).val();
});

$("#text_color").on("input", function() {
	document.body.style.color = $(this).val();
});
