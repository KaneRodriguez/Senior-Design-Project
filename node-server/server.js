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

		sendMotorUpdate("motorA", speedMotorA, directionMotorA);
		sendMotorUpdate("motorB", speedMotorB, directionMotorB);
	}


// zhu ni hao yun
// good luck?
});

app.post('/servo-update',function(req, res){
	res.setHeader('Content-Type', 'application/json');
	/*
	 * Servo :
	 * - id
	 * - position percentage
	 */
	
	var servoMotor = req.body.servoMotor || null;
             
	//mimic a slow network connection
	setTimeout(function(){

		res.send(JSON.stringify({
			servoMotor: servoMotor
		}));

	}, 1); //remove in future?

	if(servoMotor) {
		var id = servoMotor.id; 
		var positionPercentage = servoMotor.positionPercentage;

		sendServoMotorUpdate(id, positionPercentage);
	}
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
function sendServoMotorUpdate(id, positionPercentage) {
		if ( id == 'shoulder' ) {
			positionPercentage = (positionPercentage >= 90 ? 90 : (positionPercentage <= 20 ? 20 : positionPercentage ) );
		}
		if ( id == 'claw' ) {
			positionPercentage = (positionPercentage >= 73 ? 73 : (positionPercentage <= 25 ? 25 : positionPercentage ) );
		}
	    var cmd = '{"id":"' + id + '","positionPercentage":' + positionPercentage +'}';
		console.log(cmd);
		serialport.write(cmd);
}
/*
var goZero = true;
setInterval(function() {
	goZero = !goZero;
	var tmpVal = 1;
	if(goZero) {
		tmpVal = 1;
	} else {
		tmpVal = 30;
	}
	console.log(tmpVal);
	sendMotorUpdate('motorA', tmpVal, 'forward');
	sendMotorUpdate('motorB', tmpVal, 'forward');

}, 5000);
*/
