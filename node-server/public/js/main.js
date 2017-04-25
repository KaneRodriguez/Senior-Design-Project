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

/******* Servo Stuff ****/

/**

			* claw
			* elbow
			* shoulder
			* camx
			* camy
			* metald
*/

var shoulder = {
	id: 'shoulder',
	positionPercentage: 50,
	min: 8,
	max: 70
	};
var claw = {
	id: 'claw',
	positionPercentage: 50,
	min: 0,
	max: 50
	};
var elbow = {
	id: 'elbow',
	positionPercentage: 50,
	min: 0,
	max: 75
	};
var camx = {
	id: 'camx',
	positionPercentage: 50,
	min: 0,
	max: 72
	};
var camy = {
	id: 'camy',
	positionPercentage: 50,
	min: 3,
	max: 70
	};
var metald = {
	id: 'metald',
	positionPercentage: 50,
	min: 0,
	max: 70
	};

var startString = 'mousedown touchstart';
var stopSting = 'mouseup mouseleave touchend';
var myInterval = null;

assignControlTouchEventHandler('raise_shoulder',shoulder,'increase', startString, stopSting);
assignControlTouchEventHandler('lower_shoulder',shoulder,'decrease', startString, stopSting);

assignControlTouchEventHandler('lower_elbow',elbow,'increase', startString, stopSting);
assignControlTouchEventHandler('raise_elbow',elbow,'decrease', startString, stopSting);

assignControlTouchEventHandler('raise_camx',camx,'decrease', startString, stopSting);
assignControlTouchEventHandler('lower_camy',camy,'decrease', startString, stopSting);

assignControlTouchEventHandler('lower_camx',camx,'increase', startString, stopSting);
assignControlTouchEventHandler('raise_camy',camy,'increase', startString, stopSting);

assignControlTouchEventHandler('close_claw',claw,'decrease', startString, stopSting);
assignControlTouchEventHandler('open_claw',claw,'increase', startString, stopSting);

assignControlTouchEventHandler('lower_md',metald,'decrease', startString, stopSting);
assignControlTouchEventHandler('raise_md',metald,'increase', startString, stopSting);


$("#arm_front").on('click', function() {
	servoMotorCommand(shoulder, 'arm_front');
});
$("#arm_back").on('click', function() {
	servoMotorCommand(shoulder, 'arm_back');
});

function assignControlTouchEventHandler(id, obj, commandType, start, stop) {
	$('#' + id).on(start, function() {
	myInterval = setInterval(function() {
		servoMotorCommand(obj, commandType)
	}, 150);
	}).on(stop, function() {
		clearInterval(myInterval);
	});
}

function servoMotorCommand(servoObj, commandType) {
	var servoStep = 3;
	if( commandType == 'increase' ) {
		servoObj.positionPercentage += servoStep;
	} else if ( commandType == 'decrease' ) {
		servoObj.positionPercentage -= servoStep;
	} else if ( commandType == 'straight' ) {
		servoObj.positionPercentage = 100;
	}
	if( commandType == "arm_front") {
		// make shoulder go 14
		// make elbow go 56
		shoulder.positionPercentage = 14;
		elbow.positionPercentage = 56;
;		$.ajax({
				url: '/servo-update',
				type: 'POST',
				data: {
				servoMotor: shoulder
				}
		});
		$.ajax({
				url: '/servo-update',
				type: 'POST',
				data: {
				servoMotor: elbow
				}
		});
		
	} else if ( commandType == "arm_back" ) {
		// make shoulder go 70
		// make elbow go 57
		shoulder.positionPercentage = 70;
		elbow.positionPercentage = 57;
;		$.ajax({
				url: '/servo-update',
				type: 'POST',
				data: {
				servoMotor: shoulder
				}
		});
		$.ajax({
				url: '/servo-update',
				type: 'POST',
				data: {
				servoMotor: elbow
				}
		});yy
		
	} else {
		if ( servoObj.positionPercentage >= servoObj.max ) {
			servoObj.positionPercentage = servoObj.max;
		} else if ( servoObj.positionPercentage <= servoObj.min) {
			servoObj.positionPercentage = servoObj.min;
		}
		
		console.log(servoObj);
		// send via ajax
		$.ajax({
				url: '/servo-update',
				type: 'POST',
				data: {
				servoMotor: servoObj
				}
		});
	}
}

/******* End Servo Stuff ****/

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

$("#arm_straight").on("click", function() {
	servoMotorCommand(shoulder,'straight');
	servoMotorCommand(elbow,'straight');
});
