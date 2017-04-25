#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
/******************* Initialize Global Variables ********************/

#include "MTAVMotor.h"
#include "MTAVServo.h"

#define SERVOMIN  150 // this is the 'minimum' pulse length count (out of 4096)
#define SERVOMAX  600 // this is the 'maximum' pulse length count (out of 4096)

MTAVMotor motorA("motorA", "forward", 0);
MTAVMotor motorB("motorB", "forward", 0);

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

MTAVServo claw("claw", 0, 50, &pwm, SERVOMIN, SERVOMAX);
MTAVServo elbow("elbow", 1, 50, &pwm, SERVOMIN, SERVOMAX);
MTAVServo shoulder("shoulder", 2, 50, &pwm, SERVOMIN, SERVOMAX);
MTAVServo camx("camx", 3, 50, &pwm, SERVOMIN, SERVOMAX);
MTAVServo camy("camy", 4, 50, &pwm, SERVOMIN, SERVOMAX);
MTAVServo metald("metald", 8, 50, &pwm, SERVOMIN, SERVOMAX);          

/*Parallax servos are : 90-400
  micro servos are    : 120-420
  HS-5495BH servos are: 150-292 
 */

String userCommand = "";
char globalJson[200];
const int MAX_COMMAND_LENGTH = 60;
int ARDUINO_READY = 0;
/************** End Global Variable Initialization ****************/

/*********************** General Setup ***********************/
void setup() {
  Serial.begin(9600);      // open the serial port at 9600 bps:
  Serial.println("Arduino setting up yall! \n");

 pwm.begin();
  
  pwm.setPWMFreq(60);  // Analog servos run at ~60 Hz updates

  yield();
  
  motorA.setMotorLpwmRpwmEnDisPins(11, 3, 2, 4);
  motorB.setMotorLpwmRpwmEnDisPins(10, 9, 8, 7);

  motorA.updateMotor();
  motorB.updateMotor();


  // reserve 200 bytes for the userCommand (consider lowering):
  userCommand.reserve(200);

  // motorA.sendSerialMotorSpecs();

  delay(3000);

  ARDUINO_READY = 1;
}
/*********************** End General Setup ***********************/

/**************************** Main **********************************/

void loop() { // main
  motorA.updateMotor();
  motorB.updateMotor();
}

/**************************** End Main **********************************/



/************ Communication with the Pi ***************/
bool commandReceived() {
  StaticJsonBuffer<200> jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(globalJson);
  
  // Test if parsing succeeds.
  if (!root.success()) {
   // Serial.println("parseObject() failed");
    return false;
  }
  root.printTo(Serial);  
  const char * id = root["id"]; // TODO: error check if there is an "id" attribute
 
  
    // TODO: make switch lookup table
    if(strcmp(id,"motorA")==0) {
     motorA.recieveSerialMotorUpdates(root); // todo, pass in the JsonObject to the function
    }
    if(strcmp(id,"motorB")==0) {
     motorB.recieveSerialMotorUpdates(root); // todo, pass in the JsonObject to the function
    }
    
    if(strcmp(id,"claw")==0) {
     claw.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }                                                                                           //Usage: {"id":"camx", "positionPercentage":30}
    if(strcmp(id,"elbow")==0) {
     elbow.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }
    if(strcmp(id,"shoulder")==0) {
     shoulder.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }
    if(strcmp(id,"camx")==0) {
     camx.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }
    if(strcmp(id,"camy")==0) {
     camy.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }
    if(strcmp(id,"metald")==0) {
     metald.recieveSerialServoUpdates(root); // todo, pass in the JsonObject to the function
    }
  Serial.println("Arduino not dead yall! \n");
  return true;
}


int errorFlag = 0;
void serialEvent() {
  if(ARDUINO_READY) {
    while (Serial.available()) {
      // get the new byte:
  
      char inChar = (char)Serial.read();
      if( errorFlag == 0) {
          userCommand += inChar;
      } else if( inChar == '{' ) {
        errorFlag = 0;
        userCommand += inChar;
      } else {
        // ignore junk
      }
  
      if (userCommand.length() > MAX_COMMAND_LENGTH) { // REMINDER: IF COMMANDS LONGER THAN 60, CHANGE
        userCommand = "";
        errorFlag = 1;
      }
      
      // add it to the inputString:
      if (inChar == '}') { // could potentially be the end of the object
        userCommand.toCharArray(globalJson, 200);
        if (commandReceived()) {
          userCommand = "";
        } else {
          
        }
      }
    }
  }
}

/************ End Communication with the Pi ***************/



