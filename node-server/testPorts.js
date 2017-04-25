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
		spDevice.write(cmd);
	}
}
