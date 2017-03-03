#include <ArduinoJson.h>

/******************* Initialize Global Variables ********************/

#include "MTAVMotor.h"

MTAVMotor motorA("motorA", "forward", 0);
MTAVMotor motorB("motorB", "forward", 0);

String userCommand = "";

/************** End Global Variable Initialization ****************/

/*********************** General Setup ***********************/
void setup() {
    Serial.begin(9600);      // open the serial port at 9600 bps:
    motorA.setMotorLpwmRpwmEnDisPins(11, 3, 2, 4);    
    motorB.setMotorLpwmRpwmEnDisPins(10, 9, 8, 7);    

    motorA.updateMotor();
    motorB.updateMotor();

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
}

/**************************** End Main **********************************/



/************ Communication with the Pi ***************/
bool commandReceived(char json[200]) {
  StaticJsonBuffer<200> jsonBuffer;

  JsonObject& root = jsonBuffer.parseObject(json);

  // Test if parsing succeeds.
  if (!root.success()) {
    // Serial.println("parseObject() failed");
    return false;
  }

  const char * id = root["id"]; // TODO: error check if there is an "id" attribute

  // TODO: make switch lookup table
  if(strcmp(id,"motorA")==0) {
    motorA.recieveSerialMotorUpdates(root); // todo, pass in the JsonObject to the function
  }
  if(strcmp(id,"motorB")==0) {
    motorB.recieveSerialMotorUpdates(root); // todo, pass in the JsonObject to the function
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
      
      if(commandReceived(json)) {
        Serial.println("CR");
        userCommand = ""; 
        delay(100);
      } else {
        // Serial.println("Command not received");
      }
    }
  }
}

/************ End Communication with the Pi ***************/




