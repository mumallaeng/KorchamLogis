#include <IRremote.h>

#define IR_RECEIVER_PIN 8
#define ULTRASONIC_PIN 11
#define PRESSURE_SENSOR_PIN A0

// Motor pin definition
// These logical names now follow the final physical vehicle layout.
// Right wheel motor uses pins 5 and 6.
// Left wheel motor uses pins 9 and 10.
#define RIGHT_MOTOR_FWD 5
#define RIGHT_MOTOR_REV 6
#define LEFT_MOTOR_FWD 9
#define LEFT_MOTOR_REV 10

#define LINK_DATA_PIN 12
#define LINK_CLOCK_PIN 13
#define PACKET_INTERVAL_MS 150UL
#define LINK_BIT_DELAY_US 800
#define LINK_START_HOLD_US 2400
#define SPEED_PACKET_BASE 0xA0
#define ALERT_PACKET_BASE 0xB0
#define LOAD_PACKET_BASE 0xC0
#define DIRECTION_PACKET_PREFIX 0x40
#define DIRECTION_PACKET_MASK 0xC0
#define ALERT_MODE_OFF 0
#define ALERT_MODE_PULSE 1
#define ALERT_MODE_CONTINUOUS 2
#define LOAD_STATE_IDLE 0
#define LOAD_STATE_ACTIVE 1
#define DIRECTION_STATE_STOP 0
#define DIRECTION_STATE_FORWARD 1
#define DIRECTION_STATE_FORWARD_RIGHT 2
#define DIRECTION_STATE_RIGHT 3
#define DIRECTION_STATE_REVERSE_RIGHT 4
#define DIRECTION_STATE_REVERSE 5
#define DIRECTION_STATE_REVERSE_LEFT 6
#define DIRECTION_STATE_LEFT 7
#define DIRECTION_STATE_FORWARD_LEFT 8
#define PRESSURE_SAMPLE_INTERVAL_MS 200UL
#define SPEED_BUTTON_INTERVAL_MS 200UL
#define LINK_PACKET_SPEED 0
#define LINK_PACKET_ALERT 1
#define LINK_PACKET_LOAD 2
#define LINK_PACKET_DIRECTION 3

const float FAR_DISTANCE_CM = 150.0;  // Distances above this value mute buzzer 2 during the current tuning step.
const float NEAR_DISTANCE_CM = 50.0;  // Distances at or below this value use a continuous tone.
const float DISTANCE_CALIBRATION_OFFSET_CM = 10.0; // Aligns the printed distance more closely with the Tinkercad scene reading.
const float LOAD_THRESHOLD_N = 0.60;  // Turns the display LED on once the pressure sensor reaches this force.

// This sketch keeps the original working remote-and-motor behavior,
// then adds a minimal one-way synchronous link for staged validation.
//
// Link wiring in the current validation step:
// - D12: data output to the displayer UNO
// - D13: clock output to the displayer UNO
//
// The link currently sends four compact status bytes:
// - speed level
// - ultrasonic alert mode for buzzer 2
// - pressure-triggered load state for the display LED
// - remote-direction indicator state for NeoPixel output
//
// This keeps the controller close to the original working behavior while
// adding only one new sensor path at a time.

// Remote command mapping
typedef struct CommandMap {
  uint8_t command;
  float leftSpeed;
  float rightSpeed;
  bool isStop;
  bool isHold;
} CommandMap;

const CommandMap commandTable[] = {
  // Toggle commands
  {0x05,  1.0,  1.0, false, false},
  {0x0D, -1.0, -1.0, false, false},
  {0x08, -1.0,  1.0, false, false},
  {0x0A,  1.0, -1.0, false, false},
  {0x04,  0.5,  1.0, false, false},
  {0x06,  1.0,  0.5, false, false},
  {0x0C, -1.0, -0.5, false, false},
  {0x0E, -0.5, -1.0, false, false},
  {0x09,  0.0,  0.0, true,  false},

  // Hold commands
  {0x11,  1.0,  1.0, false, true},
  {0x19, -1.0, -1.0, false, true},
  {0x14, -1.0,  1.0, false, true},
  {0x16,  1.0, -1.0, false, true},
  {0x10,  0.5,  1.0, false, true},
  {0x12,  1.0,  0.5, false, true},
  {0x18, -1.0, -0.5, false, true},
  {0x1A, -0.5, -1.0, false, true},
  {0x15,  0.0,  0.0, true,  true}
};

int speedLevel = 1;              // Current speed level selected by the remote, from 1 to 5.
uint8_t toggleCommand = 0x09;    // Most recent toggle-style movement command.
uint8_t holdCommand = 0;         // Active hold-style movement command while a button is held.
float currentDistanceCm = 999.0; // Last ultrasonic distance measured in centimeters.
float currentForceN = 0.0;       // Last pressure-sensor force estimate in newtons.
uint8_t nextPacketType = LINK_PACKET_SPEED; // Rotates through speed, alert, load, and direction packets on the staged link.
bool isLoadActive = false;       // Current pressure-triggered load state sent to the display LED.
uint8_t currentDirectionState = DIRECTION_STATE_STOP; // Current remote-direction state mirrored by the display NeoPixels.
uint8_t lastAlertMode = ALERT_MODE_OFF; // Remembers the last alert mode printed to the serial monitor.
bool lastPrintedLoadState = false; // Remembers the last load state printed to the serial monitor.
uint8_t loadPacketPriorityCount = 0; // Sends load-state changes immediately and redundantly so the display LED updates reliably.
uint8_t directionPacketPriorityCount = 0; // Sends direction-state changes immediately so the NeoPixels track remote input quickly.

unsigned long lastSignalTime = 0; // Time when the last IR command was received.
unsigned long lastPacketTime = 0; // Time when the last link packet was transmitted.
unsigned long lastPressureSampleTime = 0; // Time when the pressure sensor was last sampled.
unsigned long lastSpeedButtonTime = 0; // Time when the last accepted speed-button press was handled.

bool findCommand(uint8_t command, CommandMap* result);
bool isSpeedIncreaseCommand(uint8_t command);
bool isSpeedDecreaseCommand(uint8_t command);
void controlCar(uint8_t command);
void stopCar();
int getPwm();
void increaseSpeed();
void decreaseSpeed();
void setMotorSpeed(int leftForward, int leftReverse, int rightForward, int rightReverse);
void drive(float leftSpeed, float rightSpeed);
void sendSpeedPacket();
void sendAlertPacket();
void sendLoadPacket();
void sendDirectionPacket();
uint8_t buildSpeedPacket();
uint8_t buildAlertPacket();
uint8_t buildLoadPacket();
uint8_t buildDirectionPacket();
void sendByteSync(uint8_t value);
float readDistanceCm();
float getCalibratedDistanceCm(float rawDistanceCm);
float readForceNewtons();
void updateLoadState();
void updateDirectionState(uint8_t command);
uint8_t getDirectionStateFromCommand(uint8_t command);
const char* getLoadStateLabel(bool loadActive);
uint8_t getAlertModeFromDistance(float distanceCm);
const char* getAlertModeLabel(uint8_t alertMode);

bool findCommand(uint8_t command, CommandMap* result) {
  // Look up the movement rule that matches the received remote command.
  int tableSize = sizeof(commandTable) / sizeof(CommandMap);

  for (int i = 0; i < tableSize; i++) {
    if (commandTable[i].command == command) {
      *result = commandTable[i];
      return true;
    }
  }

  return false;
}

bool isSpeedIncreaseCommand(uint8_t command) {
  // Match the top-row increase-speed button on the current Tinkercad remote layout.
  return command == 0x02;
}

bool isSpeedDecreaseCommand(uint8_t command) {
  // Match the top-row decrease-speed button on the current Tinkercad remote layout.
  return command == 0x01;
}

void setup() {
  // 흐름도 공통 시작: Controller 보드의 초기 설정 단계
  // Serial.begin(9600); // Disabled for demo capture so serial logging does not add overhead.

  // Disable IR LED feedback so D13 can be used as the link clock pin safely.
  IrReceiver.begin(IR_RECEIVER_PIN, false);

  pinMode(LEFT_MOTOR_FWD, OUTPUT);
  pinMode(LEFT_MOTOR_REV, OUTPUT);
  pinMode(RIGHT_MOTOR_FWD, OUTPUT);
  pinMode(RIGHT_MOTOR_REV, OUTPUT);
  pinMode(ULTRASONIC_PIN, OUTPUT);
  pinMode(LINK_DATA_PIN, OUTPUT);
  pinMode(LINK_CLOCK_PIN, OUTPUT);

  digitalWrite(LINK_DATA_PIN, LOW);
  digitalWrite(LINK_CLOCK_PIN, LOW);

  stopCar();
}

void loop() {
  // 흐름도 1단계 입력: 리모컨 명령을 읽고 속도/방향 상태를 갱신하는 반복 구간
  // Keep the original IR decode and motor control flow unchanged.
  if (IrReceiver.decode()) {
    uint8_t command = IrReceiver.decodedIRData.command;
    bool isRepeat = (IrReceiver.decodedIRData.flags & IRDATA_FLAGS_IS_REPEAT) != 0;
    CommandMap cmdData;

    // Serial.print("CMD: ");
    // Serial.println(command, HEX);

    // Allow speed buttons on both first press and held repeats, but limit how fast they can step.
    if ((isSpeedIncreaseCommand(command) || isSpeedDecreaseCommand(command)) &&
        (lastSpeedButtonTime == 0 || millis() - lastSpeedButtonTime >= SPEED_BUTTON_INTERVAL_MS)) {
      if (isSpeedIncreaseCommand(command)) {
        increaseSpeed();
      } else {
        decreaseSpeed();
      }

      // Serial.print("Speed level: ");
      // Serial.println(speedLevel);
      lastSpeedButtonTime = millis();
    }

    if (findCommand(command, &cmdData)) {
      if (cmdData.isHold) {
        holdCommand = command;
      } else if (!isRepeat) {
        holdCommand = 0;
        toggleCommand = command;
      }
    }

    lastSignalTime = millis();
    IrReceiver.resume();
  }

  if (holdCommand != 0 && millis() - lastSignalTime >= 200) {
    holdCommand = 0;
  }

  if (holdCommand != 0) {
    controlCar(holdCommand);
  } else {
    controlCar(toggleCommand);
  }

  // Sample the pressure sensor separately so load detection does not interfere with link timing.
  if (millis() - lastPressureSampleTime >= PRESSURE_SAMPLE_INTERVAL_MS) {
    lastPressureSampleTime = millis();
    updateLoadState();
  }

  // 흐름도 3단계 감지: 센서 상태를 바탕으로 표시용 패킷을 만들어 전송하는 구간
  // Measure distance and transmit the current minimal status payloads.
  if (millis() - lastPacketTime >= PACKET_INTERVAL_MS) {
    lastPacketTime = millis();
    currentDistanceCm = getCalibratedDistanceCm(readDistanceCm());

    if (loadPacketPriorityCount > 0) {
      sendLoadPacket();
      loadPacketPriorityCount--;
    } else if (directionPacketPriorityCount > 0) {
      sendDirectionPacket();
      directionPacketPriorityCount--;
    } else if (nextPacketType == LINK_PACKET_SPEED) {
      sendSpeedPacket();
      nextPacketType = LINK_PACKET_ALERT;
    } else if (nextPacketType == LINK_PACKET_ALERT) {
      sendAlertPacket();
      nextPacketType = LINK_PACKET_LOAD;
    } else if (nextPacketType == LINK_PACKET_LOAD) {
      sendLoadPacket();
      nextPacketType = LINK_PACKET_DIRECTION;
    } else {
      sendDirectionPacket();
      nextPacketType = LINK_PACKET_SPEED;
    }
  }
}

int getPwm() {
  // Convert the 1-5 speed level into the PWM value used for both motors.
  return map(speedLevel, 1, 5, 100, 255);
}

void increaseSpeed() {
  // Move to the next valid speed level.
  if (speedLevel < 5) {
    speedLevel++;
  }
}

void decreaseSpeed() {
  // Move to the previous valid speed level.
  if (speedLevel > 1) {
    speedLevel--;
  }
}

void setMotorSpeed(int leftForward, int leftReverse, int rightForward, int rightReverse) {
  // Each motor uses two PWM-capable pins for forward and reverse drive.
  // The parameter order stays left-first, right-second, while the pin mapping now follows the final vehicle layout.
  analogWrite(LEFT_MOTOR_FWD, leftForward);
  analogWrite(LEFT_MOTOR_REV, leftReverse);
  analogWrite(RIGHT_MOTOR_FWD, rightForward);
  analogWrite(RIGHT_MOTOR_REV, rightReverse);
}

void drive(float leftSpeed, float rightSpeed) {
  // 흐름도 2단계 주행: 현재 속도 단계와 방향 명령을 실제 좌우 모터 PWM 출력으로 바꾸는 부분
  // Convert normalized wheel direction values into PWM output.
  int pwm = getPwm();

  int leftFwd = (leftSpeed > 0.0) ? (int)(pwm * leftSpeed) : 0;
  int leftRev = (leftSpeed < 0.0) ? (int)(pwm * -leftSpeed) : 0;
  int rightFwd = (rightSpeed > 0.0) ? (int)(pwm * rightSpeed) : 0;
  int rightRev = (rightSpeed < 0.0) ? (int)(pwm * -rightSpeed) : 0;

  setMotorSpeed(leftFwd, leftRev, rightFwd, rightRev);
}

void stopCar() {
  setMotorSpeed(0, 0, 0, 0);
}

void controlCar(uint8_t command) {
  // 흐름도 2단계 주행: 입력 단계에서 결정된 명령을 바탕으로 정지 또는 주행 동작을 선택하는 부분
  // Apply the movement rule that matches the active remote command.
  CommandMap cmdData;

  if (!findCommand(command, &cmdData)) {
    return;
  }

  updateDirectionState(command);

  if (cmdData.isStop) {
    stopCar();
  } else {
    drive(cmdData.leftSpeed, cmdData.rightSpeed);
  }
}

void sendSpeedPacket() {
  // 흐름도 3단계 감지: 현재 속도 상태를 표시 보드로 전달하는 패킷 송신
  // Send the current speed level in a compact one-byte format.
  sendByteSync(buildSpeedPacket());
}

void sendAlertPacket() {
  // 흐름도 3단계 감지: 초음파 기반 경고 상태를 표시 보드로 전달하는 패킷 송신
  // Send the current ultrasonic alert mode for buzzer 2 on the display board.
  uint8_t alertMode = getAlertModeFromDistance(currentDistanceCm);

  sendByteSync(buildAlertPacket());

  // Print alert changes so the controller can confirm the ultrasonic decision locally.
  if (alertMode != lastAlertMode) {
    // Serial.print("Distance: ");
    // Serial.print(currentDistanceCm);
    // Serial.print(" cm, Alert: ");
    // Serial.println(getAlertModeLabel(alertMode));
    lastAlertMode = alertMode;
  }
}

void sendLoadPacket() {
  // 흐름도 3단계 감지: 압력센서 기반 적재 상태를 표시 보드로 전달하는 패킷 송신
  // Send the current pressure-triggered load state for the display LED.
  sendByteSync(buildLoadPacket());
}

void sendDirectionPacket() {
  // 흐름도 3단계 감지: 리모컨 방향 상태를 표시 보드의 네오픽셀 방향 표시로 전달하는 패킷 송신
  // Send the current remote-direction state for the NeoPixel direction indicator.
  sendByteSync(buildDirectionPacket());
}

uint8_t buildSpeedPacket() {
  // Encode the speed level into the low nibble so the receiver can validate it.
  return (uint8_t)(SPEED_PACKET_BASE | (speedLevel & 0x0F));
}

uint8_t buildAlertPacket() {
  // Encode the alert mode derived from the most recent ultrasonic reading.
  return (uint8_t)(ALERT_PACKET_BASE | getAlertModeFromDistance(currentDistanceCm));
}

uint8_t buildLoadPacket() {
  // Encode whether the pressure threshold is active so the display board can drive its LED.
  if (isLoadActive) {
    return (uint8_t)(LOAD_PACKET_BASE | LOAD_STATE_ACTIVE);
  }

  return (uint8_t)(LOAD_PACKET_BASE | LOAD_STATE_IDLE);
}

uint8_t buildDirectionPacket() {
  // Pack the current remote-direction state into one byte so the display board can light only the matching indicators.
  return (uint8_t)(DIRECTION_PACKET_PREFIX | (currentDirectionState & 0x0F));
}

const char* getAlertModeLabel(uint8_t alertMode) {
  // Convert the compact alert code into a readable debug label.
  if (alertMode == ALERT_MODE_OFF) {
    return "OFF";
  }

  if (alertMode == ALERT_MODE_CONTINUOUS) {
    return "CONTINUOUS";
  }

  return "PULSE";
}

void sendByteSync(uint8_t value) {
  // This is a simple synchronous protocol:
  // 1. Hold data high with clock low long enough to mark the start clearly.
  // 2. Output 8 bits on D12.
  // 3. Pulse D13 for each bit so the displayer can sample the value.
  // 4. Return both lines to the idle state.

  // Start condition: keep data high with clock low longer than a normal bit.
  digitalWrite(LINK_CLOCK_PIN, LOW);
  digitalWrite(LINK_DATA_PIN, HIGH);
  delayMicroseconds(LINK_START_HOLD_US);

  // Send 8 bits, least-significant bit first, so the receiver can reconstruct the byte.
  for (uint8_t bitIndex = 0; bitIndex < 8; bitIndex++) {
    uint8_t bitValue = (value >> bitIndex) & 0x01;

    digitalWrite(LINK_DATA_PIN, bitValue);
    delayMicroseconds(LINK_BIT_DELAY_US);

    digitalWrite(LINK_CLOCK_PIN, HIGH);
    delayMicroseconds(LINK_BIT_DELAY_US);

    digitalWrite(LINK_CLOCK_PIN, LOW);
  }

  // Return to idle state.
  digitalWrite(LINK_DATA_PIN, LOW);
  delayMicroseconds(LINK_BIT_DELAY_US);
}

float readDistanceCm() {
  // 흐름도 3단계 감지: 초음파 센서의 현재 거리를 읽는 부분
  // Use the single-pin trigger/echo pattern from the validated ultrasonic example.
  pinMode(ULTRASONIC_PIN, OUTPUT);
  digitalWrite(ULTRASONIC_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(ULTRASONIC_PIN, HIGH);
  delayMicroseconds(5);
  digitalWrite(ULTRASONIC_PIN, LOW);

  pinMode(ULTRASONIC_PIN, INPUT);

  unsigned long duration = pulseIn(ULTRASONIC_PIN, HIGH, 30000UL);

  if (duration == 0) {
    // Return a clearly out-of-range value when the simulator produces no echo pulse.
    return 999.0;
  }

  return (duration * 0.0343) / 2.0;
}

float getCalibratedDistanceCm(float rawDistanceCm) {
  // Apply a small simulator-specific offset so the reported distance better matches the Tinkercad ruler.
  if (rawDistanceCm > FAR_DISTANCE_CM) {
    return rawDistanceCm;
  }

  return rawDistanceCm + DISTANCE_CALIBRATION_OFFSET_CM;
}

float readForceNewtons() {
  // Convert the analog pressure reading into an approximate force in newtons.
  int sensorValue = analogRead(PRESSURE_SENSOR_PIN);
  return sensorValue * (10.0 / 1023.0);
}

void updateLoadState() {
  // 흐름도 3단계 감지: 압력센서 값을 읽어 적재 여부를 ACTIVE 또는 IDLE로 판단하는 부분
  // Update the pressure-triggered load state using a single threshold for solid LED control.
  bool previousLoadState = isLoadActive;

  currentForceN = readForceNewtons();
  isLoadActive = currentForceN >= LOAD_THRESHOLD_N;

  if (isLoadActive != previousLoadState || isLoadActive != lastPrintedLoadState) {
    // Serial.print("Force: ");
    // Serial.print(currentForceN);
    // Serial.print(" N, Load: ");
    // Serial.println(getLoadStateLabel(isLoadActive));
    lastPrintedLoadState = isLoadActive;
  }

  if (isLoadActive != previousLoadState) {
    // Push the new load state to the display board twice so both ON and OFF transitions are hard to miss.
    loadPacketPriorityCount = 2;
  }
}

void updateDirectionState(uint8_t command) {
  // 흐름도 1단계 입력: 리모컨 명령을 방향 표시용 상태로 변환하는 부분
  // Translate the current remote command into one of the compact direction-indicator states for the NeoPixel display.
  uint8_t previousDirectionState = currentDirectionState;

  currentDirectionState = getDirectionStateFromCommand(command);

  if (currentDirectionState != previousDirectionState) {
    // Push fresh direction states immediately so the NeoPixels react quickly to remote input changes.
    directionPacketPriorityCount = 2;
  }
}

uint8_t getDirectionStateFromCommand(uint8_t command) {
  // 흐름도 1단계 입력: 3x7 리모컨의 방향 버튼을 내부 방향 상태 코드로 매핑하는 부분
  // Map the 3x7 remote layout directly into one direction-indicator state so the four NeoPixels show the pressed direction.
  if (command == 0x05 || command == 0x11) {
    return DIRECTION_STATE_FORWARD;
  }

  if (command == 0x06 || command == 0x12) {
    return DIRECTION_STATE_FORWARD_RIGHT;
  }

  if (command == 0x0A || command == 0x16) {
    return DIRECTION_STATE_RIGHT;
  }

  if (command == 0x0E || command == 0x1A) {
    return DIRECTION_STATE_REVERSE_RIGHT;
  }

  if (command == 0x0D || command == 0x19) {
    return DIRECTION_STATE_REVERSE;
  }

  if (command == 0x0C || command == 0x18) {
    return DIRECTION_STATE_REVERSE_LEFT;
  }

  if (command == 0x08 || command == 0x14) {
    return DIRECTION_STATE_LEFT;
  }

  if (command == 0x04 || command == 0x10) {
    return DIRECTION_STATE_FORWARD_LEFT;
  }

  return DIRECTION_STATE_STOP;
}

const char* getLoadStateLabel(bool loadActive) {
  // Convert the pressure-triggered load state into a readable debug label.
  if (loadActive) {
    return "ACTIVE";
  }

  return "IDLE";
}

uint8_t getAlertModeFromDistance(float distanceCm) {
  // 흐름도 3단계 감지: 초음파 거리값을 OFF, PULSE, CONTINUOUS 경고 모드로 바꾸는 부분
  // Convert the measured distance into the three buzzer states required by the project.
  // The current tuning step uses OFF for distances above 150 cm.
  if (distanceCm > FAR_DISTANCE_CM) {
    return ALERT_MODE_OFF;
  }

  if (distanceCm <= NEAR_DISTANCE_CM) {
    return ALERT_MODE_CONTINUOUS;
  }

  return ALERT_MODE_PULSE;
}
