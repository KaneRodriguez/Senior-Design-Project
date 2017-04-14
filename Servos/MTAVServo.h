
/*
THIS NEEDS WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
I did not change the functions involving json from the MTAVMotor.h code when I copied it.
-NB



*/
#ifndef MTAVSERVO
#define MTAVSERVO

#define MAX_MTAVSERVO_POSITION 600
#define MIN_MTAVSERVO_POSITION 150
#include <ArduinoJson.h>

class MTAVServo
{
  public:
    // Constructor
    MTAVServo(String id, int servoCommand, int positionPercentage); // position in terms of percentage of 100
    // Destructor
    ~MTAVServo() {}

    // Get
    String getServoId() { return this->itsId; }
    int getServoPositionPercentage() { return this->itsPositionPercentage; }
	int getServoNumber();
	int getServoCommand() { return this->itsServoCommand; }

    
    
    // Set
    void setServoId(String id);
    void setServoPositionPercentage(int positionPercentage);
    


    
    
    // functionality 

    void updateServo();
    void displayServoSpecs();
    void sendSerialMotorSpecs();
    bool recieveSerialMotorUpdates(JsonObject& root);
    
    
  private:
    String itsId;
	int itsServoCommand;
    int itsPositionPercentage;
};

MTAVServo::MTAVServo(String id, int servoCommand, int positionPercentage) {
  this->setServoId(id);
  this->setServoPositionPercentage(positionPercentage);

  this->updateServo();
}

//This is to make it easy to integrate the adafruit code that came with the board
int getServoNumber(String id) {
	int n = 15;						//n is arbitrary for debugging 
	switch (id) {
	case "ServoShoulder":
		n = 0;
		break;
	case "ServoElbow":
		n = 1;
		break;
	default :
		n = 15;
		break;
	}
	return n;
}

void MTAVServo::setServoId(String id) {
  this->itsId = id;
}


void MTAVServo::setServoPositionPercentage(int positionPercentage) {
  if(positionPercentage) {
    this->itsPositionPercentage = ( positionPercentage >= 100 ? 100 :  ( positionPercentage <= 0 ? 0 : positionPercentage ) ); // between 0 and 100 percent (obviously)
  }
}



void MTAVServo::updateServo() {
 
  pwm.setPWM(getServoNumber(), 0, this->getServoCommand);
 
}
void MTAVServo::displayServoSpecs() {
  Serial.println("Servo Id: " + this->getServoId());
  Serial.print("Position Percentage: ");
  Serial.print(this->getServoPositionPercentage());
  Serial.print("%\n");
  Serial.print("Commanded Position Percentage: ");
  Serial.print(this->getServoCommand());
}

void MTAVServo::sendSerialMotorSpecs() {
    // Step 1: Reserve memory space
    //
    StaticJsonBuffer<200> jsonBuffer;
    
    //
    // Step 2: Build object tree in memory
    //
    JsonObject& root = jsonBuffer.createObject();
    root["type"] = "motor";
    root["id"] = this->getMotorId();
    root["direction"] = this->getMotorDirection();
    root["speedPercentage"] = this->getMotorSpeedPercentage();
    
    JsonObject& pins = jsonBuffer.createObject(); 
    pins["rpwm"] = this->getMotorRpwm();
    pins["lpwm"] = this->getMotorLpwm();
    pins["enable"] = this->getMotorEnable();
    pins["disable"] = this->getMotorDisable();


    root["pins"] = pins;
    
    //
    // Step 3: Generate the JSON string
    //
    root.printTo(Serial);  
}
bool MTAVServo::recieveSerialMotorUpdates(JsonObject& root) {
 
  // Test if parsing succeeds.
  if (!root.success()) {
    // Serial.println("parseObject() failed");
    return false;
  }

  // Fetch values.
  const char * direction = root["direction"];
  int speedPercentage = root["speedPercentage"];
  
  // TODO: parse pins

  this->setMotorDirection(direction);
  this->setMotorSpeedPercentage(speedPercentage);
  // this->sendSerialMotorSpecs();

  return true;
}
#endif

