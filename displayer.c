#include <Wire.h>
#include <Adafruit_LiquidCrystal.h>
#include <Adafruit_NeoPixel.h>

#define LINK_DATA_PIN 12
#define LINK_CLOCK_PIN 13
#define LINK_BIT_TIMEOUT_US 5000UL
#define LINK_START_HOLD_US 2400UL
#define DIRECTION_PACKET_PREFIX 0x40
#define DIRECTION_PACKET_MASK 0xC0
#define SPEED_PACKET_BASE 0xA0
#define SPEED_PACKET_MASK 0xF0
#define ALERT_PACKET_BASE 0xB0
#define ALERT_PACKET_MASK 0xF0
#define LOAD_PACKET_BASE 0xC0
#define LOAD_PACKET_MASK 0xF0
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
#define BUZZER2_PIN 3
#define LOAD_LED_PIN 5
#define RIGHT_NEOPIXEL1_PIN 6
#define RIGHT_NEOPIXEL2_PIN 7
#define LEFT_NEOPIXEL3_PIN 9
#define LEFT_NEOPIXEL4_PIN 8
#define WHEEL_PIXEL_COUNT 12
#define BUZZER2_FREQUENCY 1000
#define BUZZER_PULSE_INTERVAL_MS 100UL
#define LOAD_PACKET_TIMEOUT_MS 1000UL
#define WHEEL_ANIMATION_INTERVAL_FAST_MS 15UL
#define WHEEL_ANIMATION_INTERVAL_SLOW_MS 180UL
#define STRIP_FRONT_RIGHT 0
#define STRIP_REAR_RIGHT 1
#define STRIP_REAR_LEFT 2
#define STRIP_FRONT_LEFT 3

Adafruit_LiquidCrystal lcd(0); // Controls the I2C 16x2 LCD connected on A4 and A5.
Adafruit_NeoPixel rightPixel1(WHEEL_PIXEL_COUNT, RIGHT_NEOPIXEL1_PIN, NEO_GRB + NEO_KHZ800); // Front-right direction strip.
Adafruit_NeoPixel rightPixel2(WHEEL_PIXEL_COUNT, RIGHT_NEOPIXEL2_PIN, NEO_GRB + NEO_KHZ800); // Rear-right direction strip.
Adafruit_NeoPixel leftPixel3(WHEEL_PIXEL_COUNT, LEFT_NEOPIXEL3_PIN, NEO_GRB + NEO_KHZ800); // Rear-left direction strip.
Adafruit_NeoPixel leftPixel4(WHEEL_PIXEL_COUNT, LEFT_NEOPIXEL4_PIN, NEO_GRB + NEO_KHZ800); // Front-left direction strip.

// This sketch is the first validated receiver stage for the displayer UNO.
//
// Current behavior:
// - D12 receives the data line from the controller UNO
// - D13 receives the clock line from the controller UNO
// - speed packets update the current speed label in the serial monitor
// - ultrasonic alert packets drive buzzer 2 using the project warning rules
// - pressure-triggered load packets drive the display LED on D5
// - direction packets drive only the NeoPixel strips that match the remote direction
// - the LCD mirrors the latest speed and alert state from the controller
//
// This avoids LCD, NeoPixel, and buzzer complexity until the link itself
// is proven stable in Tinkercad.

int currentSpeedLevel = 1;         // Last valid speed level received from the controller.
uint8_t currentAlertMode = 0;      // Last valid buzzer mode received from the controller.
uint8_t currentLoadState = 0;      // Last valid pressure-triggered LED state received from the controller.
uint8_t currentDirectionState = DIRECTION_STATE_STOP; // Last valid remote-direction state received from the controller.
bool buzzerPulseState = false;     // Current on/off state for pulsed buzzer output.
unsigned long lastPulseTime = 0;   // Time when the buzzer pulse state last toggled.
unsigned long lastLoadPacketTime = 0; // Time when the last valid load packet was received from the controller.
int lastPrintedSpeedLevel = 0;     // Tracks the last speed value already printed to reduce serial blocking.
uint8_t lastPrintedAlertMode = 255; // Tracks the last alert value already printed to reduce serial blocking.
uint8_t lastPrintedLoadState = 255; // Tracks the last load value already printed to reduce serial blocking.
uint8_t lastPrintedDirectionState = 255; // Tracks the last direction state already printed to reduce serial blocking.
int lastLcdSpeedLevel = 0;         // Tracks the last speed value already drawn on the LCD.
uint8_t lastLcdAlertMode = 255;    // Tracks the last alert value already drawn on the LCD.
uint8_t lastPixelSpeedLevel = 0;   // Tracks the last speed level already shown on the NeoPixels.
uint8_t lastPixelDirectionState = 255; // Tracks the last direction state already shown on the NeoPixels.
uint8_t directionAnimationIndex = 0;   // Selects which LED index in each active strip is currently highlighted during the direction effect.
unsigned long lastDirectionAnimationTime = 0; // Time when the direction animation last advanced to the next strip pixel.

bool waitForStartCondition();
bool waitForClockHigh();
bool waitForClockLow();
bool receiveByteSync(uint8_t* value);
bool decodeSpeedPacket(uint8_t value, int* speedLevel);
bool decodeAlertPacket(uint8_t value, uint8_t* alertMode);
bool decodeLoadPacket(uint8_t value, uint8_t* loadState);
bool decodeDirectionPacket(uint8_t value, uint8_t* directionState);
const char* getSpeedLabel(int speedLevel);
const char* getAlertModeLabel(uint8_t alertMode);
const char* getLoadStateLabel(uint8_t loadState);
const char* getDirectionStateLabel(uint8_t directionState);
void setupLcd();
void setupNeoPixels();
void refreshLcdIfNeeded();
void refreshLcd();
void refreshDirectionPixelsIfNeeded();
void refreshDirectionPixels();
void updateDirectionAnimation();
void applyDirectionToStrip(Adafruit_NeoPixel* strip, uint8_t stripPosition);
bool isStripActiveForDirection(uint8_t stripPosition);
bool isDirectionReversed();
uint32_t getDirectionColor(Adafruit_NeoPixel* pixel);
uint8_t getBasePixelBrightness();
void updateBuzzer2();
void updateLoadLed();

void setup() {
  // 흐름도 공통 시작: Displayer 보드의 LCD, 부저, LED, 네오픽셀 초기 설정 단계
  // Serial.begin(9600); // Disabled for demo capture so serial logging does not add overhead.

  pinMode(LINK_DATA_PIN, INPUT);
  pinMode(LINK_CLOCK_PIN, INPUT);
  pinMode(BUZZER2_PIN, OUTPUT);
  pinMode(LOAD_LED_PIN, OUTPUT);

  noTone(BUZZER2_PIN);
  digitalWrite(LOAD_LED_PIN, LOW);
  setupLcd();
  setupNeoPixels();
  refreshLcd();
  refreshDirectionPixels();
  lastLcdSpeedLevel = currentSpeedLevel;
  lastLcdAlertMode = currentAlertMode;
  lastPixelSpeedLevel = currentSpeedLevel;
  lastPixelDirectionState = currentDirectionState;
}

void loop() {
  // 흐름도 4단계 표시: Controller 패킷을 받아 LCD, 부저, LED, 네오픽셀을 갱신하는 반복 구간
  uint8_t receivedValue;
  int decodedSpeedLevel;
  uint8_t decodedAlertMode;
  uint8_t decodedLoadState;
  uint8_t decodedDirectionState;

  // Read one byte at a time, then decode it by packet type.
  if (receiveByteSync(&receivedValue)) {
    if (decodeSpeedPacket(receivedValue, &decodedSpeedLevel)) {
      currentSpeedLevel = decodedSpeedLevel;

      // Print only when the speed value changes so serial output does not delay the next packet.
      if (currentSpeedLevel != lastPrintedSpeedLevel) {
        // Serial.print("Speed packet: ");
        // Serial.print(currentSpeedLevel);
        // Serial.print(" (");
        // Serial.print(getSpeedLabel(currentSpeedLevel));
        // Serial.println(")");
        lastPrintedSpeedLevel = currentSpeedLevel;
      }

      refreshLcdIfNeeded();
      refreshDirectionPixelsIfNeeded();
    } else if (decodeAlertPacket(receivedValue, &decodedAlertMode)) {
      currentAlertMode = decodedAlertMode;

      // Print only when the alert mode changes so the buzzer receiver stays responsive.
      if (currentAlertMode != lastPrintedAlertMode) {
        // Serial.print("Alert packet: ");
        // Serial.println(getAlertModeLabel(currentAlertMode));
        lastPrintedAlertMode = currentAlertMode;
      }

      refreshLcdIfNeeded();
    } else if (decodeLoadPacket(receivedValue, &decodedLoadState)) {
      currentLoadState = decodedLoadState;
      lastLoadPacketTime = millis();

      // Print only when the load LED mode changes so serial output stays lightweight.
      if (currentLoadState != lastPrintedLoadState) {
        // Serial.print("Load packet: ");
        // Serial.println(getLoadStateLabel(currentLoadState));
        lastPrintedLoadState = currentLoadState;
      }
    } else if (decodeDirectionPacket(receivedValue, &decodedDirectionState)) {
      currentDirectionState = decodedDirectionState;

      // Print only when the direction indicator state changes so serial output stays lightweight.
      if (currentDirectionState != lastPrintedDirectionState) {
        // Serial.print("Direction packet: ");
        // Serial.println(getDirectionStateLabel(currentDirectionState));
        lastPrintedDirectionState = currentDirectionState;
      }

      refreshDirectionPixelsIfNeeded();
    }
  }

  // Drive buzzer 2 continuously, even when no new packet arrives in this loop pass.
  updateBuzzer2();
  updateLoadLed();
  updateDirectionAnimation();
}

bool waitForStartCondition() {
  // Wait for the controller to hold data high with clock low long enough
  // to distinguish a true packet start from a normal data bit.
  unsigned long startTime = micros();
  unsigned long highHoldStart = 0;

  while (micros() - startTime < LINK_BIT_TIMEOUT_US) {
    if (digitalRead(LINK_CLOCK_PIN) == LOW && digitalRead(LINK_DATA_PIN) == HIGH) {
      if (highHoldStart == 0) {
        highHoldStart = micros();
      }

      if (micros() - highHoldStart >= LINK_START_HOLD_US) {
        return true;
      }
    } else {
      highHoldStart = 0;
    }
  }

  return false;
}

bool waitForClockHigh() {
  // Wait for the next sampling edge from the controller.
  unsigned long startTime = micros();

  while (micros() - startTime < LINK_BIT_TIMEOUT_US) {
    if (digitalRead(LINK_CLOCK_PIN) == HIGH) {
      return true;
    }
  }

  return false;
}

bool waitForClockLow() {
  // Wait for the controller to finish the current bit pulse.
  unsigned long startTime = micros();

  while (micros() - startTime < LINK_BIT_TIMEOUT_US) {
    if (digitalRead(LINK_CLOCK_PIN) == LOW) {
      return true;
    }
  }

  return false;
}

bool receiveByteSync(uint8_t* value) {
  uint8_t result = 0;

  // Do not read anything until the controller sends the start condition.
  if (!waitForStartCondition()) {
    return false;
  }

  // Sample 8 bits, least-significant bit first.
  for (uint8_t bitIndex = 0; bitIndex < 8; bitIndex++) {
    if (!waitForClockHigh()) {
      return false;
    }

    if (digitalRead(LINK_DATA_PIN) == HIGH) {
      result |= (1 << bitIndex);
    }

    if (!waitForClockLow()) {
      return false;
    }
  }

  // Reject an all-high frame because it usually means the receiver sampled noise or lost alignment.
  if (result == 0xFF) {
    return false;
  }

  *value = result;
  return true;
}

bool decodeSpeedPacket(uint8_t value, int* speedLevel) {
  // 흐름도 4단계 표시: 수신 바이트가 속도 표시용 패킷인지 해석하는 부분
  int decodedLevel;

  // Accept only the current speed packet type.
  if ((value & SPEED_PACKET_MASK) != SPEED_PACKET_BASE) {
    return false;
  }

  decodedLevel = value & 0x0F;

  // The controller uses only speed levels 1 through 5.
  if (decodedLevel < 1 || decodedLevel > 5) {
    return false;
  }

  *speedLevel = decodedLevel;
  return true;
}

bool decodeAlertPacket(uint8_t value, uint8_t* alertMode) {
  // 흐름도 4단계 표시: 수신 바이트가 부저/LCD 경고 상태 패킷인지 해석하는 부분
  uint8_t decodedMode;

  // Accept only the current alert packet type.
  if ((value & ALERT_PACKET_MASK) != ALERT_PACKET_BASE) {
    return false;
  }

  decodedMode = value & 0x0F;

  // The controller uses only the three project alert modes.
  if (decodedMode > ALERT_MODE_CONTINUOUS) {
    return false;
  }

  *alertMode = decodedMode;
  return true;
}

bool decodeLoadPacket(uint8_t value, uint8_t* loadState) {
  // 흐름도 4단계 표시: 수신 바이트가 적재 LED 상태 패킷인지 해석하는 부분
  uint8_t decodedState;

  // Accept only the current load packet type.
  if ((value & LOAD_PACKET_MASK) != LOAD_PACKET_BASE) {
    return false;
  }

  decodedState = value & 0x0F;

  // The controller uses only the two LED states for the pressure-triggered load signal.
  if (decodedState > LOAD_STATE_ACTIVE) {
    return false;
  }

  *loadState = decodedState;
  return true;
}

bool decodeDirectionPacket(uint8_t value, uint8_t* directionState) {
  // 흐름도 4단계 표시: 수신 바이트가 네오픽셀 방향 표시 패킷인지 해석하는 부분
  uint8_t decodedState;

  // Accept only the current direction-indicator packet type.
  if ((value & DIRECTION_PACKET_MASK) != DIRECTION_PACKET_PREFIX) {
    return false;
  }

  decodedState = value & 0x0F;

  // The controller uses only the remote directions present on the 3x7 remote layout.
  if (decodedState > DIRECTION_STATE_FORWARD_LEFT) {
    return false;
  }

  *directionState = decodedState;
  return true;
}

const char* getSpeedLabel(int speedLevel) {
  // Match the final display vocabulary expected by the project.
  if (speedLevel == 1) {
    return "MIN";
  }

  if (speedLevel == 5) {
    return "MAX";
  }

  if (speedLevel == 2) {
    return "2";
  }

  if (speedLevel == 3) {
    return "3";
  }

  return "4";
}

const char* getAlertModeLabel(uint8_t alertMode) {
  // Match the three alert states used for buzzer 2.
  if (alertMode == ALERT_MODE_OFF) {
    return "OFF";
  }

  if (alertMode == ALERT_MODE_CONTINUOUS) {
    return "CONTINUOUS";
  }

  return "PULSE";
}

const char* getLoadStateLabel(uint8_t loadState) {
  // Match the two states used for the pressure-triggered load LED.
  if (loadState == LOAD_STATE_ACTIVE) {
    return "ACTIVE";
  }

  return "IDLE";
}

const char* getDirectionStateLabel(uint8_t directionState) {
  // Convert the compact direction-indicator state into a readable debug label.
  if (directionState == DIRECTION_STATE_FORWARD) {
    return "FORWARD";
  }

  if (directionState == DIRECTION_STATE_FORWARD_RIGHT) {
    return "FORWARD_RIGHT";
  }

  if (directionState == DIRECTION_STATE_RIGHT) {
    return "RIGHT";
  }

  if (directionState == DIRECTION_STATE_REVERSE_RIGHT) {
    return "REVERSE_RIGHT";
  }

  if (directionState == DIRECTION_STATE_REVERSE) {
    return "REVERSE";
  }

  if (directionState == DIRECTION_STATE_REVERSE_LEFT) {
    return "REVERSE_LEFT";
  }

  if (directionState == DIRECTION_STATE_LEFT) {
    return "LEFT";
  }

  if (directionState == DIRECTION_STATE_FORWARD_LEFT) {
    return "FORWARD_LEFT";
  }

  return "STOP";
}

void setupLcd() {
  // Initialize the 16x2 I2C LCD used for the staged display output.
  lcd.begin(16, 2);
  lcd.setBacklight(HIGH);
  lcd.clear();
}

void setupNeoPixels() {
  // Initialize each NeoPixel strip that visualizes one physical direction position on the display board.
  rightPixel1.begin();
  rightPixel2.begin();
  leftPixel3.begin();
  leftPixel4.begin();
}

void refreshLcdIfNeeded() {
  // Update the LCD only when the displayed state has changed to reduce I2C bus load.
  if (currentSpeedLevel == lastLcdSpeedLevel && currentAlertMode == lastLcdAlertMode) {
    return;
  }

  refreshLcd();
  lastLcdSpeedLevel = currentSpeedLevel;
  lastLcdAlertMode = currentAlertMode;
}

void refreshLcd() {
  // 흐름도 4단계 표시: 속도와 경고 상태를 LCD 두 줄에 출력하는 부분
  // Show the latest speed label and alert state on the LCD.
  lcd.setCursor(0, 0);
  lcd.print("SPD:");
  lcd.print(getSpeedLabel(currentSpeedLevel));
  lcd.print("        ");

  lcd.setCursor(0, 1);
  lcd.print("ALERT:");
  lcd.print(getAlertModeLabel(currentAlertMode));
  lcd.print("      ");
}

void refreshDirectionPixelsIfNeeded() {
  // Update the NeoPixels only when speed or remote direction state changes.
  if (currentSpeedLevel == lastPixelSpeedLevel &&
      currentDirectionState == lastPixelDirectionState) {
    return;
  }

  refreshDirectionPixels();
  lastPixelSpeedLevel = currentSpeedLevel;
  lastPixelDirectionState = currentDirectionState;
}

void refreshDirectionPixels() {
  // 흐름도 4단계 표시: 현재 방향 상태에 맞는 네오픽셀 스트립만 선택해서 갱신하는 부분
  // Show the current remote direction by lighting only the strips that match that direction.
  applyDirectionToStrip(&rightPixel1, STRIP_FRONT_RIGHT);
  applyDirectionToStrip(&rightPixel2, STRIP_REAR_RIGHT);
  applyDirectionToStrip(&leftPixel3, STRIP_REAR_LEFT);
  applyDirectionToStrip(&leftPixel4, STRIP_FRONT_LEFT);
}

void updateDirectionAnimation() {
  // 흐름도 4단계 표시: 속도 단계에 맞춰 네오픽셀 방향 표시의 이동 속도를 조절하는 부분
  unsigned long animationInterval;

  // Advance the direction animation continuously while at least one indicator strip is active.
  if (currentDirectionState == DIRECTION_STATE_STOP) {
    return;
  }

  animationInterval = map(currentSpeedLevel, 1, 5, WHEEL_ANIMATION_INTERVAL_SLOW_MS, WHEEL_ANIMATION_INTERVAL_FAST_MS);

  if (millis() - lastDirectionAnimationTime < animationInterval) {
    return;
  }

  lastDirectionAnimationTime = millis();
  directionAnimationIndex = (uint8_t)((directionAnimationIndex + 1) % WHEEL_PIXEL_COUNT);
  refreshDirectionPixels();
}

void applyDirectionToStrip(Adafruit_NeoPixel* strip, uint8_t stripPosition) {
  // 흐름도 4단계 표시: 선택된 방향 스트립 안에서 파란 픽셀 두 개를 실제로 점등하는 부분
  uint8_t activePixelIndex = directionAnimationIndex;
  uint8_t nextPixelIndex;
  uint32_t directionColor = getDirectionColor(strip);
  bool isActiveStrip = isStripActiveForDirection(stripPosition);

  // Reverse the moving pixel for reverse-related commands so front/back indicators do not all sweep the same way.
  if (isDirectionReversed()) {
    activePixelIndex = (uint8_t)((WHEEL_PIXEL_COUNT - 1) - activePixelIndex);
  }

  nextPixelIndex = (uint8_t)((activePixelIndex + 1) % WHEEL_PIXEL_COUNT);

  for (uint8_t pixelIndex = 0; pixelIndex < WHEEL_PIXEL_COUNT; pixelIndex++) {
    // Clear the whole strip first, then light only the two-pixel marker on active direction strips.
    strip->setPixelColor(pixelIndex, 0);
  }

  if (isActiveStrip) {
    strip->setPixelColor(activePixelIndex, directionColor);
    strip->setPixelColor(nextPixelIndex, directionColor);
  }

  strip->show();
}

bool isStripActiveForDirection(uint8_t stripPosition) {
  // Map each remote direction to the matching physical vehicle corners on the display board.
  if (currentDirectionState == DIRECTION_STATE_FORWARD) {
    return stripPosition == STRIP_FRONT_RIGHT || stripPosition == STRIP_FRONT_LEFT;
  }

  if (currentDirectionState == DIRECTION_STATE_FORWARD_RIGHT) {
    return stripPosition == STRIP_FRONT_RIGHT;
  }

  if (currentDirectionState == DIRECTION_STATE_RIGHT) {
    return stripPosition == STRIP_FRONT_RIGHT || stripPosition == STRIP_REAR_RIGHT;
  }

  if (currentDirectionState == DIRECTION_STATE_REVERSE_RIGHT) {
    return stripPosition == STRIP_REAR_RIGHT;
  }

  if (currentDirectionState == DIRECTION_STATE_REVERSE) {
    return stripPosition == STRIP_REAR_RIGHT || stripPosition == STRIP_REAR_LEFT;
  }

  if (currentDirectionState == DIRECTION_STATE_REVERSE_LEFT) {
    return stripPosition == STRIP_REAR_LEFT;
  }

  if (currentDirectionState == DIRECTION_STATE_LEFT) {
    return stripPosition == STRIP_FRONT_LEFT || stripPosition == STRIP_REAR_LEFT;
  }

  if (currentDirectionState == DIRECTION_STATE_FORWARD_LEFT) {
    return stripPosition == STRIP_FRONT_LEFT;
  }

  return false;
}

bool isDirectionReversed() {
  // Reverse the moving pixel for reverse-related commands so the active indicator looks consistent with front/back direction changes.
  return currentDirectionState == DIRECTION_STATE_REVERSE ||
         currentDirectionState == DIRECTION_STATE_REVERSE_RIGHT ||
         currentDirectionState == DIRECTION_STATE_REVERSE_LEFT;
}

uint32_t getDirectionColor(Adafruit_NeoPixel* pixel) {
  uint8_t baseBrightness = getBasePixelBrightness();

  // Use one blue indicator color so the active strip position alone communicates direction.
  return pixel->Color(0, 0, baseBrightness);
}

uint8_t getBasePixelBrightness() {
  // Scale the NeoPixel brightness from the current speed level.
  return (uint8_t)map(currentSpeedLevel, 1, 5, 40, 255);
}

void updateBuzzer2() {
  // 흐름도 4단계 표시: 초음파 경고 모드에 따라 피에조 부저를 끄거나 울리는 부분
  // Apply the buzzer behavior that matches the latest ultrasonic alert mode.
  if (currentAlertMode == ALERT_MODE_OFF) {
    noTone(BUZZER2_PIN);
    buzzerPulseState = false;
    return;
  }

  if (currentAlertMode == ALERT_MODE_CONTINUOUS) {
    tone(BUZZER2_PIN, BUZZER2_FREQUENCY);
    return;
  }

  if (millis() - lastPulseTime >= BUZZER_PULSE_INTERVAL_MS) {
    lastPulseTime = millis();
    buzzerPulseState = !buzzerPulseState;
  }

  if (buzzerPulseState) {
    tone(BUZZER2_PIN, BUZZER2_FREQUENCY);
  } else {
    noTone(BUZZER2_PIN);
  }
}

void updateLoadLed() {
  // 흐름도 4단계 표시: 적재 상태에 따라 LED를 켜거나 끄는 부분
  // Fail safe to OFF if the display board stops receiving fresh load packets.
  if (currentLoadState == LOAD_STATE_ACTIVE && millis() - lastLoadPacketTime > LOAD_PACKET_TIMEOUT_MS) {
    currentLoadState = LOAD_STATE_IDLE;

    if (lastPrintedLoadState != LOAD_STATE_IDLE) {
      // Serial.println("Load packet: IDLE (timeout)");
      lastPrintedLoadState = LOAD_STATE_IDLE;
    }
  }

  // Keep the display LED on while the pressure threshold is active, otherwise turn it off.
  if (currentLoadState == LOAD_STATE_ACTIVE) {
    digitalWrite(LOAD_LED_PIN, HIGH);
  } else {
    digitalWrite(LOAD_LED_PIN, LOW);
  }
}
