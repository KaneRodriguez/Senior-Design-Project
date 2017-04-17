#ifndef MTAVSERVO
#define MTAVSERVO

#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

class MTAVServo
{
  public:
    // Constructor
    MTAVServo(String id, int boardNum, int positionPercentage, Adafruit_PWMServoDriver* controller, int Min, int Max); // position in terms of percentage of 100

    // Destructor
    ~MTAVServo() {}

    // Get
    String getServoId() {
      return this->itsId;
    }
    int getServoPositionPercentage() {
      return this->itsPositionPercentage;
    }
    int getBoardNumber() {
      return this->itsBoardNumber;
    }
    int getMin() { return this->itsMin;}
    int getMax() { return this->itsMax;}

    
    // Set
    void setServoId(String id);
    void setServoPositionPercentage(int positionPercentage);
    void setBoardNumber(int boardNum) {
      this->itsBoardNumber = boardNum;
    }
    void setServoMin(int Min);
    void setServoMax(int Max);
    // functionality

    void updateServo();
    void displayServoSpecs();
    bool recieveSerialServoUpdates(JsonObject& root);

Adafruit_PWMServoDriver* controller;
  private:
    String itsId; // armServo
    int itsBoardNumber; // 0 -> 15
    int itsPositionPercentage; // 0 to 100
    int itsMin; // found by iteration (different per servo)
    int itsMax; // found by iteration (different per servo)
};

MTAVServo::MTAVServo(String id, int boardNumber, int positionPercentage, Adafruit_PWMServoDriver * controller, int Min, int Max) {
  this->controller = controller;
  this->setServoId(id);
  this->setServoPositionPercentage(positionPercentage);
  this->setBoardNumber(boardNumber);
  
  this->setServoMin(Min);
  this->setServoMax(Max);
  
  // NOTE: DO NOT UPDATE HERE
}

void MTAVServo::setServoId(String id) {
  this->itsId = id;
}

void MTAVServo::setServoPositionPercentage(int positionPercentage) {
  this->itsPositionPercentage = ( positionPercentage >= 100 ? 100 :  ( positionPercentage <= 0 ? 0 : positionPercentage ) ); // between 0 and 100 percent (obviously)
}
void MTAVServo::setServoMin(int Min) {
  this->itsMin = Min;
}
void MTAVServo::setServoMax(int Max) {
  this->itsMax = Max;
}

void MTAVServo::updateServo() {
  // (board number, ?????????, pulse length)

  // quickly turn the percentage into actual value

  int difference = this->getMax() - this->getMin(); //MAX_MTAVSERVO_POSITION - MIN_MTAVSERVO_POSITION;
  int pos = this->getServoPositionPercentage() * difference / 100 + this->getMin(); //MIN_MTAVSERVO_POSITION;
    Serial.println(this->getServoPositionPercentage());

  Serial.println(this->getMax());

  Serial.println(this->getMin());

  Serial.println(pos);
  this->controller->setPWM(this->getBoardNumber(), 0, pos); // TODO: Why 0?????????
}

void MTAVServo::displayServoSpecs() {
  Serial.println("Servo Id: " + this->getServoId());
  Serial.print("Position Percentage: ");
  Serial.print(this->getServoPositionPercentage());
  Serial.print("%\n");
  Serial.print("Board Number: ");
  Serial.print(this->getBoardNumber());
  Serial.print("%\n");
  Serial.print("Min Pulse Length: ");
  Serial.print(this->getMin());
  Serial.print("%\n");
  Serial.print("Max Pulse Length: ");
  Serial.print(this->getMax());
}

bool MTAVServo::recieveSerialServoUpdates(JsonObject& root) {

  // Test if parsing succeeds.
  if (!root.success()) {
    // Serial.println("parseObject() failed");
    return false;
  }

  // {"id": "shoulder", "positionPercentage": 50}

  // Fetch values.
  const char * id = root["id"];
  int positionPercentage = root["positionPercentage"];
   Serial.println(id);
  Serial.println(positionPercentage);
  this->setServoPositionPercentage(positionPercentage);
  // this->sendSerialServoSpecs();

  return true;
}
#endif


