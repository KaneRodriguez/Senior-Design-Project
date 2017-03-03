/*

The MTAVMotor object should look like the following


  Motor
    - enablePin
    - disablePin
    - rpwm
    - lpwm
    - move(speed, direction) // speed in terms of percentage of 100, direction is either "forward" or "reverse"
    - itsId
    - stop()
 
*/
#ifndef MTAVMOTOR
#define MTAVMOTOR

#define MAX_MTAVMOTOR_SPEED 255
#include <ArduinoJson.h>

class MTAVMotor
{
  public:
    // Constructor
    MTAVMotor(String id, String dir, int speedPercentage); // speed in terms of percentage of 100
    // Destructor
    ~MTAVMotor() {}

    // Get
    String getMotorId() { return this->itsId; }
    String getMotorDirection() { return this->itsDirection; }
    int getMotorSpeedPercentage() { return this->itsSpeedPercentage; }

    int getMotorRpwm() { return this->itsRpwm; }
    int getMotorLpwm() { return this->itsLpwm; }
    int getMotorDisable() { return this->itsDisable; }
    int getMotorEnable() { return this->itsEnable; }
    
    // Set
    void setMotorId(String id);
    void setMotorDirection(String dir); // "forward" or "reverse"
    void setMotorSpeedPercentage(int speedPercentage);
    
    void setMotorRpwm(int rpwm);
    void setMotorLpwm(int lpwm);
    void setMotorDisable(int disable);
    void setMotorEnable(int enable);

    void setMotorLpwmRpwmEnDisPins(int lpwm, int rpwm, int enable, int disable) {
      this->setMotorLpwm(lpwm); this->setMotorRpwm(rpwm); this->setMotorDisable(disable); this->setMotorEnable(enable);
    }
    
    // functionality 
    void stopMotor();
    void updateMotor();
    void displayMotorSpecs();
    void displayPinSpecs();
    void sendSerialMotorSpecs();
    bool recieveSerialMotorUpdates(JsonObject& root);
    
    
  private:
    String itsId;
    int itsEnable;
    int itsDisable;
    int itsRpwm;
    int itsLpwm;
    String itsDirection;
    int itsSpeedPercentage;
};

MTAVMotor::MTAVMotor(String id, String dir, int speedPercentage) {
  this->setMotorId(id);
  this->setMotorDirection(dir);
  this->setMotorSpeedPercentage(speedPercentage);

  this->updateMotor();
}

void MTAVMotor::setMotorId(String id) {
  this->itsId = id;
}
void MTAVMotor::setMotorDirection(String dir) {
  // Nick N, add a check so that we may ignore CaSe ( we want "Forward" to work as well )
    if(dir) {
      this->itsDirection = ( ( dir == "forward" ) || ( dir == "reverse") ? dir : "forward" );
    }
}
void MTAVMotor::setMotorSpeedPercentage(int speedPercentage) {
  if(speedPercentage) {
    this->itsSpeedPercentage = ( speedPercentage >= 100 ? 100 :  ( speedPercentage <= 0 ? 0 : speedPercentage ) ); // between 0 and 100 percent (obviously)
  }
}

void MTAVMotor::setMotorRpwm(int rpwm) {
  this->itsRpwm = rpwm;
}
void MTAVMotor::setMotorLpwm(int lpwm) {
  this->itsLpwm = lpwm;
}
void MTAVMotor::setMotorDisable(int disable) {
  this->itsDisable = disable;
}
void MTAVMotor::setMotorEnable(int enable) {
  this->itsEnable = enable;
}
void MTAVMotor::stopMotor() {
    this->setMotorSpeedPercentage(0);
    this->updateMotor(); 
}
void MTAVMotor::updateMotor() {
  // update the motor speed and direction here
  
  // TODO: This is where you will implement the logic for gradually shifting from forward to reverse (instead of immediately)

  // keep in mind that this speed is on an inverse scale of the MAX. Meaning, 0 is the fastest, MAX is the slowest...
  int speed = MAX_MTAVMOTOR_SPEED - ( ((float)this->getMotorSpeedPercentage()/100) * MAX_MTAVMOTOR_SPEED); // SPECIAL CASE: The Max is when the motor is stopped
  String direction = this->getMotorDirection();
  digitalWrite(this->itsEnable, HIGH); // turn enable on
  if( direction == "reverse" ) {
    digitalWrite(this->itsRpwm, HIGH); // reverse
    analogWrite(this->itsLpwm, speed);
  } else {
    digitalWrite(this->itsLpwm, HIGH); // forward
    analogWrite(this->itsRpwm, speed);  
  }
}
void MTAVMotor::displayMotorSpecs() {
  Serial.println("Motor Id: " + this->getMotorId());
  Serial.print("Speed Percentage: ");
  Serial.print(this->getMotorSpeedPercentage());
  Serial.print("%\n");
  Serial.println("Direction: " + this->getMotorDirection() + "\n");
}
void MTAVMotor::displayPinSpecs() {
  Serial.println("Motor Id: " + this->getMotorId());
  Serial.print("RPWM: ");
  Serial.println(this->getMotorRpwm());
  Serial.print("LPWM: ");
  Serial.println(this->getMotorLpwm());
  Serial.print("ENABLE: ");
  Serial.println(this->getMotorEnable());
  Serial.print("DISABLE: ");
  Serial.println(this->getMotorDisable());  
}
void MTAVMotor::sendSerialMotorSpecs() {
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
bool MTAVMotor::recieveSerialMotorUpdates(JsonObject& root) {
 
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
  this->sendSerialMotorSpecs();

  return true;
}
#endif
