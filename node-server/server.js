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

/******************** MODS *****************************/

var ignoreMotors = false; // change to true to ignore motors
			  // and forego setting up motor connections

/******************** MODS *****************************/

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
	if(tracks && !ignoreMotors) {
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

	if(servoMotor && !ignoreMotors) {
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
if(!ignoreMotors)
{
	
	var SerialPort = require("serialport");
	var spDevice = null;
	var i = 1;
	// setting up the serial connection
	var connectDevice = function() {
	    //---------------------------------------
	SerialPort.list(function (err, ports) {
		  if( ports != undefined ) {
			  var port = null;  

			  var found = ports.some(function(p, index, array) {
				if(p != undefined) {
					console.log(p.comName);
					console.log(p.pnpId);
					console.log(p.manufacturer);
					if(p.comName == '/dev/ttyACM0')
						{
							port = p;
							return true;    
						}
				}

				return false;
			  });


			  if(found)
			  {
				spDevice = new SerialPort(port.comName.replace("cu","tty"), {
					baudrate: 9600,
					parser: SerialPort.parsers.readline("\n"),
					disconnectedCallback: function() {console.log('You pulled the plug!');}         
				});         
				if( spDevice != undefined && spDevice != null) {
					// do something with incoming data
					spDevice.on('data', function (data) {
						 console.log('count : ' + (i++));
						console.log('data received: ' + data);
					});

					spDevice.on('close', function(){
						console.log('ARDUINO PORT CLOSED');
						spDevice = null;
						reconnectDevice();
					});

					spDevice.on('error', function (err) {
						console.log("ERROR");
						spDevice = null;
						console.error("error", err);
						reconnectDevice();
					});

					spDevice.on('disconnected', function (err) {
						console.log('on.disconnect');
						spDevice = null;
						reconnectDevice();
					}); 
				}
			  }
			  else
			  {   
				setTimeout(connectDevice, 1000);
			  }      
		  } 
	    });
	    //---------------------------------------
	}
	connectDevice();
	/*** testing function
	setInterval(function() {
		sendMotorUpdate("motorA",20,"forward");
	}, 1000);
	***/
	// check for connection errors or drops and reconnect
	var reconnectDevice = function () {
	  console.log('INITIATING RECONNECT');
	  setTimeout(function() {
	    console.log('RECONNECTING TO ARDUINO');
	    connectDevice();
	  }, 2000);
	};

	function sendMotorUpdate(id, speed, direction) {
		if (spDevice != null) {
			var cmd = '{"id":"' + id + '","direction":"' + direction +'","speedPercentage":' + speed +'}';
			spDevice.write(cmd);	
		}
	}
	function sendServoMotorUpdate(id, positionPercentage) {
		if (spDevice != null) {

		    var cmd = '{"id":"' + id + '","positionPercentage":' + positionPercentage +'}';
			console.log(cmd);
			spDevice.write(cmd);
		}
	}
}
