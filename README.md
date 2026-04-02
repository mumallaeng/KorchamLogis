English | [한국어](README.ko.md)

> A project carried out as part of the *[Consortium] On-Device AI System Semiconductor Design, 2nd Cohort* curriculum.

# KorchamLogis: Autonomous Robot-Based Store Logistics Automation System

<img width="500" alt="korchamlogis x2" src="https://github.com/user-attachments/assets/c0369e20-2928-4446-96df-b8d9f50b5547" />
<img width="300" alt="korchamcar x2" src="https://github.com/user-attachments/assets/d46f275b-0d87-457e-a10d-e82cb1015306" />

Team 8, Palajo

KorchamLogis is an autonomous robot-based store logistics automation system that improves shoe store operating efficiency and enhances the customer experience. This repository holds both the driving subsystem of KorchamLogis, **KorchamCar** (Arduino-based `controller.c`/`displayer.c`), and the manager GUI prototype, **logistics-management** (a React app).

## Role Assignment

| Name | Role |
|---|---|
| Yeonwoo Gim ([@mumallaeng](https://github.com/mumallaeng)) | Team lead, driving control (motor + remote) |
| Younghyun Lee ([@younghyun0702](https://github.com/younghyun0702)) | Member, object detection and feedback (ultrasonic sensor + buzzer) |
| Chanmi Lee ([@ichanmi1009](https://github.com/ichanmi1009)) | Member, recognition result output (LCD + NeoPixel) |
| Gwanggeun Jeong ([@fourevere](https://github.com/fourevere)) | Member, load detection (pressure sensor + LED) |

## 1. KorchamLogis (Overall System)

### 1.1 Project Overview

#### Project Background and Purpose

KorchamLogis is an autonomous robot-based store logistics automation system that improves shoe store operating efficiency and enhances the customer experience. This project aims to resolve the limitations of existing store operations and build a forward-looking smart store operating model.

#### Key Problems Addressed

The core problems identified in existing shoe store operations are as follows:

- **Operational inefficiency**: Increased staff fatigue from repetitive picking work, and gaps in customer service while staff move to and from the warehouse
- **Degraded customer experience**: Fatigue from wait times and psychological burden when requesting additional fitting items
- **Operational limitations**: Lost sales from abandoned purchases or insufficient satisfaction

#### Project Goals and Expected Effects

The main goals to be achieved through building this system are as follows:

- **Operational standardization**: Reduce dependency on individual skill level by systematizing work procedures, standardizing operations
- **Improved working environment**: Reduce repetitive work and movement, easing staff fatigue and improving the working environment
- **Stabilized service quality**: Minimize gaps in customer service to provide a consistent customer experience, stabilizing service quality
- **Secured scalability**: Secure a scalable structure that can flexibly respond to changes in the store environment

### 1.2 Work Performed

#### Solution Overview

KorchamLogis implements an integrated solution that resolves store operating limitations through an autonomous robot-based logistics automation system. The core components of the system are as follows:

- **QR scan-based item verification**: Simplifies item verification and requests
- **Automatic picking by Korchambot**: Automatically picks up and delivers items
- **Integrated manager app control**: Controls and manages the logistics robot
- **Support for staff focus on customer service**: Lets staff focus on customer service

#### System Architecture

##### Overall System Structure

<img width="4033" height="1952" alt="Picture1" src="https://github.com/user-attachments/assets/a1846499-f5f0-4d8d-97cb-7fa21041a06f" />

A request initiated in the manager app passes through the cloud server to the robot, and the collected data is used for AI training, forming an integrated structure:

- **Manager app**: Handles QR scan item requests and request information
- **Cloud server**: Generates inventory-check work orders
- **Robot controller**: Controls Korchambot's autonomous driving
- **Database**: Stores user/order item/inventory management data
- **AI training server**: Improves the video analysis model

##### Process Flow

Real-time order status checks provide a transparent logistics process, letting the app monitor the entire process from order to delivery in real time:

- **QR scan request**: A store staff member scans the QR code of a customer-requested item using the manager app
- **Automatic order creation**: The scan information is sent to the system, and after an inventory check, an item request is created automatically
- **Robot movement and loading**: Korchambot moves to the warehouse where the item is located and loads it
- **Item delivery**: The robot moves to the requested location, delivers the item, and checks status in real time
- **Return to warehouse**: After delivery is complete, the robot returns to the warehouse to wait for the next order

#### User Interface Design

##### Staff GUI Interface

A three-stage staff management system consisting of 8 interfaces was developed:

**Stage 1: Order intake**
- Composed of 4 interfaces: login → QR scan → item lookup → order creation

**Stage 2: Status management**
- Real-time monitoring via 2 interfaces: work status lookup → cancellation request

**Stage 3: Logistics processing**
- Sequential processing via 2 interfaces: picking complete → delivery started → delivery complete

| Interface ID | Name | Direction | Description |
|---|---|---|---|
| AU | Login authentication request | Staff GUI->Main Service | User authentication |
| IS | Item lookup | Staff GUI->Main Service | QR-based item lookup |
| IR | Order creation | Staff GUI->Main Service | Order creation |
| TR | Work status lookup | Staff GUI->Main Service | Status lookup |
| CD | Cancellation request | Staff GUI->Main Service | Delivery cancellation |
| PK | Picking complete | Staff GUI->Main Service | Loading complete |
| DS | Delivery started | Staff GUI->Main Service | Delivery started |
| DR | Delivery complete | Staff GUI->Main Service | Receipt complete |

##### Inter-System Control Interfaces

- **Work status updates**: Guides on-site work in real time via work status changes and picking requests sent from the main server to the staff app
- **Robot control monitoring**: Systematically manages driving status by delivering robot control commands and receiving robot status information
- **AI analysis integration**: Performs basic recognition with an on-device AI model, and when an event occurs, sends data to the AI server to improve model performance

| Interface ID | Name | Direction | Description |
|---|---|---|---|
| TR_NOTIFY | Work status notification | Main Service->Staff GUI | Status change push |
| SR | Picking request | Main Service->Staff GUI | Picking request |
| RC | Robot control | Main Service->Robot | Movement command |
| RS | Robot status report | Robot->Main Service | Status report |
| IN | AI recognition result | AI Server->Main Service | Object recognition |

### 1.3 System Implementation Results

#### Data Structure

<img width="2223" height="1192" alt="image" src="https://github.com/user-attachments/assets/12b18b4a-baa4-4f24-a3aa-47c72ad33cb8" />

**User/order data**
- `users`: Staff account and other user information
- `deliveries`: Stores orders as units
- `delivery_items`: Manages the list of items included in an order

**Item/inventory data**
- `items`: Basic item information and location
- `inventory`: Manages stock quantity by location

**Task/robot control data**
- `tasks`: Manages order-based tasks, tracking picking and delivery status step by step
- `kochambot_commands`: Stores robot control commands
- `kochambots`: Manages robot status information

#### Prototype Implementation

We successfully implemented a prototype that can be tested in a real store environment. We completed UI/UX design through Figma and built a fully working system [1].

<table>
<tr>
<td><img width="180" alt="0-login" src="https://github.com/user-attachments/assets/788f4937-6b01-44af-b9b2-561561c82b5a" /></td>
<td><img width="180" alt="1-dashboard" src="https://github.com/user-attachments/assets/9170966c-3d96-463d-b54d-2a6bebdabd9c" /></td>
<td><img width="180" alt="2-scan" src="https://github.com/user-attachments/assets/bbe04ff8-633c-4d1c-a8c5-5627e65bfab6" /></td>
<td><img width="180" alt="3-item" src="https://github.com/user-attachments/assets/60f18f69-ef33-44f4-a800-dd3083467786" /></td>
</tr>
<tr>
<td><img width="180" alt="4-request" src="https://github.com/user-attachments/assets/d68dc31b-56ba-46d1-85e6-56d5f890e3bb" /></td>
<td><img width="180" alt="5-request-list" src="https://github.com/user-attachments/assets/113dc571-a3d5-4376-907b-059a674e18cd" /></td>
<td><img width="180" alt="6-item-list-1" src="https://github.com/user-attachments/assets/71f30e17-edfd-4994-bb70-8bb3ded04e36" /></td>
<td><img width="180" alt="7-item-list-2" src="https://github.com/user-attachments/assets/412f003a-2ef0-4969-b7ac-ee37b5491af4" /></td>
</tr>
</table>

### 1.4 Testing and Verification Results

#### Feature Test Results

We conducted comprehensive tests to verify system functionality and confirmed that all core features operate normally:

**Login functionality verification**
- Confirmed staff account entry moves to the main screen and correctly displays the current work status

**Request history management**
- Confirmed detail screen navigation, cancellation of pending requests, receipt-complete processing, and robot return requests

**QR code scan**
- Confirmed camera QR recognition works correctly, along with item lookup and order creation

**Inventory lookup system**
- Confirmed the full inventory list display, out-of-stock request handling, and the delivery connection flow

#### Workflow Verification

Test result: All core features operate normally, and the entire workflow based on user scenarios was successfully verified.

We comprehensively verified system stability and usability through scenario tests reflecting actual usage patterns, with particular focus on confirming the system's ability to respond to the various situations that can occur in a store environment.

### 1.5 Future Plans and Recommendations

#### Implementation Results and System Completeness

- **System implementation complete**: We successfully completed the store logistics automation system and the integration between Korchambot and the manager app.
- **Workflow verification**: We implemented the entire process based on user scenarios and built a real-time status management system.

#### Future Expansion Plans

- **Application to various store environments**: We plan to expand the system, currently optimized for shoe stores, to other retail categories. We are reviewing its applicability to various store environments such as clothing, accessories, and household goods [2].
- **Multi-robot operation system**: We plan to expand to a system that can operate multiple robots simultaneously in large or complex stores, enabling efficient logistics automation even in larger stores.

#### Technology Advancement Directions

- **Improving AI recognition accuracy**: We plan to continuously improve AI performance for item recognition, route optimization, and obstacle avoidance through ongoing data collection and machine learning [3].
- **Direct customer-facing interface**: The system is currently implemented for staff use, but we plan to develop a self-service interface for direct customer use in the future, providing an even more innovative shopping experience.

### 1.6 Conclusion

- **System completion**: Implemented a complete logistics automation system through manager app and Korchambot integration
- **Improved efficiency**: Optimized store operations by reducing staff fatigue and improving customer service quality
- **Future development**: Ongoing development plans through application to various store environments and AI technology advancement

Building on the technology and experience gained through this project, we will continue to develop innovative solutions that lead the digital transformation of the retail industry.

### References (KorchamLogis)

[1] Figma prototype. (2026). KorchamLogis store logistics automation system UI/UX design. https://www.figma.com/make/Qo0HTzDHZ71qYTwwVJsWBy/korcham?t=ffSlvnubIWrMOLpn-1&preview-route=%2Flogin

[2] HAI ROBOTICS. (2024). SF DHL footwear automated logistics center project. https://www.hairobotics.com/kr/cases/sf-dhl-footwear

[3] ColdChain News. (2024). Logistics automation, key to logistics competitiveness — DX, AI, and robotics matter. https://www.coldchainnews.kr/news/article.html?no=26789

## 2. KorchamCar (Driving Subsystem)

2026.04.01 ~ 2026.04.02

### 2.1 Project Overview

#### Project Background and Purpose

This project is a sub-development task carried out based on KorchamLogis [0]. KorchamLogis is a system aimed at logistics automation, with the main purpose of transporting items and improving work efficiency using robots. This report is limited to describing the development of KorchamCar, which focuses on the driving function of the overall system. KorchamCar is a driving-specialized platform that separately implements the movement and driving functions from KorchamBot as an independent unit.

KorchamCar is a hardware-based smart transport solution designed to reduce the physical burden on workers who must carry heavy boxes by hand. Workers intuitively steer the cart with an IR remote control, and it is equipped with collision prevention (audio alerts) via an ultrasonic sensor and load-detection via a pressure sensor, eliminating safety incidents in the store at the source.

#### Core Goals

- **Emergency warning feature**: Sounds a piezo buzzer to warn when an obstacle is detected within a set distance ahead while driving
- **5-level speed control**: Smoothly adjusts driving speed across 5 levels (via PWM control) using the IR remote, enabling fine control even in narrow spaces
- **Load status and driving information visualization**: Detects whether cargo is loaded on the cart via a pressure sensor and shows it with an LED, and displays the robot's current driving status (direction, speed, obstacle presence, load status) in real time on an LCD screen

#### Expected Effects

| Feature | Worker | Store Manager | Customer |
|---|---|---|---|
| Driving | Improved working environment | High-efficiency work at low cost | Improved service quality |
| Collision prevention | Provides psychological safety | Protects the robot and company assets | Provides a safe shopping environment |
| Load detection | Improves carrying focus | Prevents loss from dropped items | Improves brand trust |
| Real-time status output | Provides an intuitive control environment | Enables operational status monitoring | Enables predicting robot behavior |

### 2.2 Project Planning and Problem-Solving Direction

#### Problem Definition

Large stores and logistics warehouses currently operate by having workers carry heavy items by hand. This manual-labor-centered operating method has three major limitations:

- **Severe physical exhaustion for workers**: Repeatedly carrying heavy cargo sharply increases workers' physical fatigue and adds to the burden of musculoskeletal disorders.
- **Safety risk from limited visibility**: High-stacked loads block forward visibility, creating a constant risk of dangerous collisions with other workers, pedestrians, or store facilities while moving.
- **Reduced work efficiency and psychological anxiety**: Having to move carefully while avoiding collisions with a heavy load slows down work, and workers carry the anxiety of possibly dropping items or causing an accident.

#### Solution Direction

- Physical exhaustion from manual labor → Developed an intuitive remote-controlled driving system via IR remote
- Accidents from failure to secure visibility → Developed a smart braking system that sounds an alert and stops when a sensor detects an obstacle
- Anxiety about whether the robot is working normally → Developed a real-time streaming system that displays robot status as text on an LCD

#### Development Environment and Tools

| Category | Details |
|---|---|
| Development tool | Tinkercad |
| Communication | IRremote, LiquidCrystal I2C, Wire |
| Collaboration tools | Notion, KakaoTalk |

### 2.3 System Design

#### System Architecture

<img width="1199" height="405" alt="image1" src="https://github.com/user-attachments/assets/4ae36703-0234-4674-84f8-891b02c7111c" />

In this project, we developed KorchamCar, focusing solely on the driving function of KorchamLogis's KorchamBot.

<img width="1142" height="539" alt="image2" src="https://github.com/user-attachments/assets/227ba594-94f9-42e3-b552-5c1f62ab5ed8" />

KorchamCar consists of a Displayer and a Controller. We drove the wheels using DC motors, but since Tinkercad does not support attaching wheels, we used NeoPixels for visual understanding.

To prevent collisions while driving, we configured an ultrasonic sensor to detect objects, display the detection on the LCD, and alert with a buzzer sound. Driving control is done via the remote control, and load status is represented with a pressure sensor and an LED.

#### Parts List

| Name | Quantity | Component |
|---|---|---|
| Controller, Displayer | 2 | Arduino Uno R3 |
| Battery | 2 | 9V Battery |
| Motor driver | 1 | H-bridge Motor Driver |
| Wheel motors | 4 | DC Motor |
| NeoPixels for wheel visualization | 4 | NeoPixel Ring 12 |
| IR sensor for remote signal detection | 1 | IR sensor |
| Infrared remote | 1 | IR remote |
| Ultrasonic sensor | 1 | Ultrasonic Distance Sensor |
| Buzzer for object-detection alert | 1 | Piezo |
| LCD | 1 | MCP23008-based, 32 (0x20) LCD 16 x 2 (I2C) |
| Pressure sensor | 1 | Force Sensor |
| Pressure sensor resistor | 1 | 10 kΩ Resistor |
| LED for load-detection alert | 1 | Red LED |
| LED resistor | 1 | 270 Ω Resistor |
| Regulator | 1 | 5V Regulator [LM7805] |

#### Arduino Circuit Design

**Controller pin layout**

Inputs

| Input | Pin |
|---|---|
| IR sensor | D8 |
| Ultrasonic sensor | D11 |
| Pressure sensor | A0 |

Outputs

| Output | Pin |
|---|---|
| [1, 1] wheel motor | D5, D6 |
| [1, 2] wheel motor | D5, D6 |
| [2, 1] wheel motor | D9, D10 |
| [2, 2] wheel motor | D9, D10 |

**Displayer pin layout**

Outputs

| Output | Pin |
|---|---|
| [1, 1] NeoPixel | D6 |
| [1, 2] NeoPixel | D7 |
| [2, 1] NeoPixel | D9 |
| [2, 2] NeoPixel | D10 |
| LCD (SDA) | A4 |
| LCD (SCL) | A5 |
| Piezo buzzer | D3 |
| LED | D5 |

#### Remote Control Design

- **Speed control**: Divides the maximum output value by 2 to map 255 into 5 levels, giving levels 1 through 5
- **LCD output**: Displays the current speed level (MAX at the highest, MIN at the lowest)
- **3x7 layout**: The top row adjusts speed; the remaining rows are split into three groups each, with toggle direction keys on top and hold direction keys below

<img width="198" height="405" alt="image3" src="https://github.com/user-attachments/assets/0a71726c-c5bb-48fd-8cd3-c6cae98dda14" />

| Stop | Decrease speed | Increase speed |
|---|---|---|
| ↖ | ↑ | ↗ |
| ← | Stop | → |
| ↙ | ↓ | ↘ |

### 2.4 Implementation and Verification

With this flow in place, we established the following performance evaluation criteria for verification:

- **Driving function**: Forward/backward/left-turn/right-turn operation via DC motors
- **Remote input**: Remote control signal reception via the IR sensor
- **Obstacle detection**: Collision prevention system via the ultrasonic sensor
- **Load status detection**: Cargo load status check via the pressure sensor
- **Status output**: Real-time information display via the LCD and LED
- **Integrated operation**: Simultaneous operation and interoperability of all systems

Verification confirmed that the following items operate normally:

<img width="480" height="654" alt="full run test" src="https://github.com/user-attachments/assets/33e0684f-7e49-46f1-88cf-6b32abc3a29d" />

<table>
<tr>
<td><img width="350" alt="remote motor control" src="https://github.com/user-attachments/assets/b675027e-ecd5-48a3-a410-0338f4af66a3" /></td>
<td><img width="350" alt="4-wheel motor remote control" src="https://github.com/user-attachments/assets/cbf36dad-8f03-400e-ad24-2b4acddfab61" /></td>
</tr>
<tr>
<td><img width="350" alt="ultrasonic sensor + buzzer" src="https://github.com/user-attachments/assets/5a306475-67b7-45e4-9504-bee4b9621768" /></td>
<td><img width="350" alt="pressure sensor + LED" src="https://github.com/user-attachments/assets/1e244f97-ce41-4533-8ead-c959f63a12c4" /></td>
</tr>
</table>

1. **DC motor + remote**: Confirmed that toggle forward movement and stop input are correctly reflected
2. **Ultrasonic sensor + buzzer communication**: Confirmed distinct warning levels for distance > 150cm, 50cm < distance < 150cm, and distance <= 50cm
3. **LCD**: Confirmed the 5-level speed display and obstacle-detection signal display
4. **Pressure sensor + LED communication**: Confirmed correct switching, with the LED OFF at force <= 0.6N and ON at force >= 0.6N

### 2.5 Project Outcomes and Limitations

#### Outcomes

- **Improved safety**: Minimized collision risk with an ultrasonic-sensor-based stop-alert system
- **Work efficiency**: Achieved precise driving control via 5-level speed control
- **User convenience**: Provided intuitive status information via LCD and LED
- **System stability**: Achieved stable communication and control through a dual-Arduino structure

#### Limitations and Improvement Directions

- **Unstable control from IR signal range**: Potential malfunction due to the limited reception range of the remote control
- **Blind spots from insufficient ultrasonic sensors**: A front-only sensor leaves collision risk on the sides and rear
- **Distance error from floor friction**: Distance measurement error depending on floor material, creating potential collision risk

#### Future Improvement Plans

- Build a 360-degree obstacle detection system using multiple ultrasonic sensors
- Improve control stability with WiFi- or Bluetooth-based wireless communication
- Strengthen visual obstacle recognition by adding a camera module

### 2.6 Conclusion and Lessons Learned

#### Project Completeness

All requirements were met, including remote control, collision prevention, load-status detection, and real-time information display, resulting in a prototype usable at a level suitable for an actual logistics site.

#### Lessons Learned and Insights

During development, we experienced issues where communication delays or sensor conflicts caused the system to freeze, which made us realize that a single line of faulty code can affect the entire system. This helped us understand how important stability and completeness are at the design stage.

We also felt that providing core functionality intuitively matters more than packing in many features. We reaffirmed the importance of always considering the information users need and designing with convenience in mind, and learned that good engineering is design that users can trust and easily understand.

### Reference (KorchamCar)

[0] KorchamLogis GitHub - KorchamCar https://github.com/mumallaeng/KorchamLogis
