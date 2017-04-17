#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
/******************* Initialize Global Variables ********************/

#include "MTAVMotor.h"
#include "MTAVServo.h"

MTAVMotor motorA("motorA", "forward", 0);
MTAVMotor motorB("motorB", "forward", 0);

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

MTAVServo claw("claw", 0, 0, &pwm, 120, 420);
MTAVServo elbow("elbow", 1, 0, &pwm, 120, 440);
MTAVServo shoulder("shoulder", 2, 0, &pwm, 120, 440);
MTAVServo camx("camx", 3, 0, &pwm, 120, 440);
MTAVServo camy("camy", 4, 0, &pwm, 120, 440);
MTAVServo metald("metald", 5, 0, &pwm, 120, 440);

String userCommand = "";

/************** End Global Variable Initialization ****************/

/*********************** General Setup ***********************/
void setup() {
  Serial.begin(9600);      // open the serial port at 9600 bps:
  Serial.println("Arduino setting up! \n");

  pwm.begin();
  
  pwm.setPWMFreq(60);  // Analog servos run at ~60 Hz updates

  yield();
  
  motorA.setMotorLpwmRpwmEnDisPins(11, 3, 2, 4);
  motorB.setMotorLpwmRpwmEnDisPins(10, 9, 8, 7);

  motorA.updateMotor();
  motorB.updateMotor();

  claw.updateServo();
  elbow.updateServo();
  shoulder.updateServo();
  camx.updateServo();
  camy.updateServo();
  metald.updateServo();

  // reserve 200 bytes for the userCommand (consider lowering):
  userCommand.reserve(200);

  Serial.println("Arduino set up! \n");

  // motorA.sendSerialMotorSpecs();

  delay(3000);


}
/*********************** End General Setup ***********************/

/**************************** Main **********************************/

void loop() { // main

  // update motors
  motorA.updateMotor();
  motorB.updateMotor();

  // update servos
  claw.updateServo();
  elbow.updateServo();
  shoulder.updateServo();
  camx.updateServo();
  camy.updateServo();
  metald.updateServo();
  
}

/**************************** End Main **********************************/



/************ Communication with the Pi ***************/
bool commandReceived(char json[200]) {
  StaticJsonBuffer<200> jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(json);
      Serial.println("bout to parse obje");

  // Test if parsing succeeds.
  if (!root.success()) {
   // Serial.println("parseObject() failed");
    return false;
  }
      Serial.println("parsed obje");

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
    }                                                                                           //{"id":"claw", "positionPercentage":30}
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

  return true;
}



void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();

    userCommand += inChar;

    // add it to the inputString:
    if (inChar == '}') { // could potentially be the end of the object
      char json[200];
      userCommand.toCharArray(json, 200);
      
      if (commandReceived(json)) {
        // Serial.println("CR");
        userCommand = "";
        delay(100);
      } else {
        Serial.println("Command not received");
      }
    }
  }
}

/************ End Communication with the Pi ***************/



