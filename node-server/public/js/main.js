/******* Video Stuff ****/

// Show loading notice
		var videoCanvas = document.getElementById('videoCanvas');
		var ctx = videoCanvas.getContext('2d');
		ctx.fillStyle = '#444';
		ctx.fillText('Loading...', videoCanvas.width/2-30, videoCanvas.height/3);




		// Setup the WebSocket connection and start the player
		var client = new WebSocket('ws://doesitreallymatter:8084/');
		var player = new jsmpeg(client, {canvas:videoCanvas});

		

/******* End Video Stuff ****/




window.addEventListener("load", function() {
	document.getElementById("shutdown_fake").style.color = "#0f0";
});



document.getElementById('slider').addEventListener('input', function() {
	document.body.style.opacity = this.value;
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
