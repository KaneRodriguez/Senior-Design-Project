//require the express nodejs module
var express = require('express'),
	//set an instance of exress
	app = express(),
	//require the body-parser nodejs module
	bodyParser = require('body-parser'),
	//require the path nodejs module
	path = require("path");
var exec = require("child_process").exec

//support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

//tell express that www is the root of our public web folder
app.use(express.static(path.join(__dirname, 'public')));

//tell express what to do when the /form route is requested
app.post('/tracks-update',function(req, res){
	res.setHeader('Content-Type', 'application/json');
	var tracks = req.body.tracks || null;
	//mimic a slow network connection
	setTimeout(function(){

		res.send(JSON.stringify({
			tracks: tracks
		}));

	}, 1); //remove in future?

	// feel free to toggle which is left and which is right
	if(tracks) {
		var motorATrack = tracks.left; // switch right and left if things look wierd
		var motorBTrack = tracks.right;


		var directionMotorA = ( motorATrack <= 0  ? "forward" : "reverse");
		var speedMotorA = Math.abs(motorATrack)

		var directionMotorB = ( motorBTrack <= 0  ? "forward" : "reverse");
		var speedMotorB = Math.abs(motorBTrack);
		console.log(tracks);

		// error on arduino side, lets just fix it here. Percentages of 0 will not register
		// so, add 1 if we are zero

		if(speedMotorA <= 0) {
			speedMotorA = 1;
		}
		if(speedMotorB <= 0) {
			speedMotorB = 1;
		}




		sendMotorUpdate("motorA", speedMotorA, directionMotorA);
		sendMotorUpdate("motorB", speedMotorB, directionMotorB);
	}


// zhu ni hao yun
// good luck?
});

app.post('/shutdown',function(req, res){
	var shutdown = req.body.shutdown || null;

	if(shutdown) {
		console.log("shutting down...");
		exec('sudo shutdown -h now',function(err, stdout, stderr) {console.log(err, stdout, stderr)});
		console.log("should we have shut down by now?");
	}
});

//wait for a connection
app.listen(80, '0.0.0.0', function () {
  console.log('Server is running. Point your browser to: http://localhost:3000');
});

/***************************************************

	Connection to Arduino

***************************************************/

var SerialPort = require("serialport");
var serialport = new SerialPort("/dev/ttyACM0", {
  parser: SerialPort.parsers.readline('\n')
});
serialport.on('open', function(){
  console.log('Serial Port Opened');
  serialport.on('data', function(data){

			 console.log("data received:" + data);

	});
});
function sendMotorUpdate(motorId, speed, direction) {
		serialport.write('{"id":"' + motorId + '","direction":"' + direction +'","speedPercentage":' + speed +'}');
}




