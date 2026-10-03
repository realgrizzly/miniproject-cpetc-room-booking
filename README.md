# 🏫 CPETC Room Booking System

ระบบจองห้องออนไลน์สำหรับ **CPETC** พัฒนาขึ้นเพื่อช่วยให้ผู้ใช้งานสามารถตรวจสอบข้อมูลห้องและส่งคำขอจองห้องผ่านเว็บไซต์ได้อย่างสะดวก พร้อมระบบจัดการสำหรับผู้ดูแลระบบ (Admin) เพื่อจัดการข้อมูลห้อง ผู้ใช้งาน และคำขอจองห้อง

---

## 📌 Project Overview

**CPETC Room Booking System** เป็น Web Application สำหรับจัดการการจองห้องภายในสถานศึกษา โดยแบ่งการใช้งานออกเป็น 2 ส่วนหลัก ได้แก่

- 👤 **User** — สามารถเข้าสู่ระบบ ดูห้อง และส่งคำขอจองห้อง
- 👨‍💼 **Admin** — สามารถจัดการผู้ใช้งาน ห้อง และอนุมัติหรือปฏิเสธคำขอจอง

ระบบใช้ **Firebase Authentication** สำหรับการเข้าสู่ระบบและจัดการบัญชีผู้ใช้งาน และใช้ **Cloud Firestore** เป็นฐานข้อมูลหลักของระบบ

ในส่วนการจัดการข้อมูลห้อง ใช้ **PHP API** เชื่อมต่อกับ Cloud Firestore เพื่อให้ Admin สามารถเพิ่ม แก้ไข ลบ และโหลดข้อมูลห้องผ่านหน้าเว็บไซต์ได้

---

# ✨ Features

## 👤 User

ผู้ใช้งานทั่วไปสามารถ:

- สมัครสมาชิก
- เข้าสู่ระบบ
- ออกจากระบบ
- ดูข้อมูลบัญชีของตนเอง
- ดูรายการห้อง
- ดูรายละเอียดห้อง
- ตรวจสอบสถานะห้อง
- เลือกห้องที่ต้องการจอง
- ระบุวันที่จอง
- ระบุเวลาเริ่มต้นและสิ้นสุด
- ระบุจำนวนผู้ใช้งาน
- ส่งคำขอจองห้อง
- ตรวจสอบสถานะคำขอจอง

สถานะการจองประกอบด้วย:

- 🟡 `pending` — รออนุมัติ
- 🟢 `approved` — อนุมัติแล้ว
- 🔴 `rejected` — ปฏิเสธแล้ว

---

# 👨‍💼 Admin Features

Admin สามารถจัดการระบบผ่านหน้า Admin Dashboard

### 👥 User Management

สามารถ:

- ดูรายชื่อผู้ใช้งาน
- ดู Email
- ดู Role
- แก้ไขชื่อผู้ใช้งาน
- เปลี่ยน Role
- ลบข้อมูล Profile ผู้ใช้งาน

Role ที่ระบบรองรับ:

```text
admin
user
```

---

### 🏫 Room Management

Admin สามารถ:

- เพิ่มห้อง
- แก้ไขข้อมูลห้อง
- ลบห้อง
- ดูรายการห้องทั้งหมด
- ตรวจสอบสถานะห้อง
- จัดเรียงห้องตามหมายเลขห้อง

ข้อมูลห้องประกอบด้วย:

```text
Room Name
Room Type
Capacity
Building
Equipment
Status
```

ตัวอย่างข้อมูล:

```text
Room Name : CPE 613
Room Type : Classroom
Capacity  : 40
Building  : CPE
Equipment : Projector, Computer
Status    : available
```

สถานะห้อง:

```text
available
unavailable
```

---

### 📋 Booking Management

Admin สามารถดูคำขอจองห้องของผู้ใช้งาน และดำเนินการกับคำขอได้

การทำงาน:

```text
User
 │
 │ ส่งคำขอจอง
 ▼
pending
 │
 ├──► approved
 │
 └──► rejected
```

Admin สามารถ:

- ดูคำขอจอง
- ดูผู้จอง
- ดูห้องที่จอง
- ดูวันที่จอง
- ดูเวลา
- ดูจำนวนผู้ใช้งาน
- อนุมัติคำขอ
- ปฏิเสธคำขอ
- กรองคำขอตามสถานะ

---

# 🛠️ Technologies

## Frontend

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase JavaScript SDK

## Backend

- PHP
- PHP Built-in Development Server
- Google Cloud Firestore PHP Client

## Database

- Firebase Authentication
- Cloud Firestore

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Composer
- PHP
- Firebase Console

---

# 📁 Project Structure

```text
MINIPROJECT-ROOM-BOOKING-main/
│
├── ADMIN/
│   ├── admin.html
│   └── Admin.js
│
├── api/
│   └── rooms/
│       ├── create.php
│       ├── delete.php
│       ├── list.php
│       └── update.php
│
├── config/
│   ├── firebase-config.js
│   ├── firebase.php
│   └── serviceAccountKey.json
│
├── CSS/
│   └── Admin.css
│
├── vendor/
│
├── composer.json
├── composer.lock
└── README.md
```

---

# 🔥 Firebase

ระบบใช้ Firebase ใน 2 ส่วนหลัก

### Firebase Authentication

ใช้สำหรับ:

- สมัครสมาชิก
- Login
- Logout
- ตรวจสอบผู้ใช้งานที่ Login อยู่

---

### Cloud Firestore

ระบบใช้ Collection หลัก ได้แก่:

```text
users
rooms
bookings
```

โครงสร้างโดยประมาณ:

```text
users
 └── user UID
      ├── name
      ├── email
      └── role
```

```text
rooms
 └── room ID
      ├── roomName
      ├── roomType
      ├── capacity
      ├── building
      ├── equipment
      └── status
```

```text
bookings
 └── booking ID
      ├── userId
      ├── roomId
      ├── roomName
      ├── bookingDate
      ├── startTime
      ├── endTime
      ├── people
      ├── status
      └── createdAt
```

---

# 🔐 Security

ระบบแบ่งสิทธิ์การใช้งานเป็น:

```text
User
Admin
```

ผู้ใช้งานทั่วไปสามารถเข้าถึงข้อมูลของตนเองตามสิทธิ์ที่กำหนด

Admin สามารถจัดการข้อมูลระบบ เช่น:

- Users
- Rooms
- Bookings

Firestore Security Rules ถูกใช้เพื่อควบคุมการเข้าถึงข้อมูล

ตัวอย่างแนวคิด:

```text
User
 │
 ├── ดูข้อมูลตัวเอง
 ├── สร้าง Booking ของตัวเอง
 └── ไม่สามารถจัดการ Room
     
Admin
 │
 ├── จัดการ Users
 ├── จัดการ Rooms
 └── จัดการ Booking
```

---

# ⚙️ Requirements

ก่อนใช้งานควรติดตั้ง:

### PHP

แนะนำ PHP 8.x หรือใหม่กว่า

ตรวจสอบ PHP:

```bash
php -v
```

---

### Composer

ตรวจสอบ Composer:

```bash
composer -V
```

---

### Firebase

ต้องมี Firebase Project และเปิดใช้งาน:

- Firebase Authentication
- Cloud Firestore

---

### Google Cloud Firestore PHP Client

ติดตั้งด้วย Composer:

```bash
composer install
```

หรือ:

```bash
composer require google/cloud-firestore
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/realgrizzly/miniproject-cpetc-room-booking.git
```

เข้าสู่โฟลเดอร์:

```bash
cd miniproject-cpetc-room-booking
```

---

## 2. Install PHP Dependencies

```bash
composer install
```

---

## 3. ตั้งค่า Firebase

สร้าง Firebase Project แล้วเปิด:

```text
Authentication
Firestore Database
```

จากนั้นสร้าง Firebase Web App และนำ Configuration มาใส่ใน:

```text
config/firebase-config.js
```

ตัวอย่าง:

```javascript
import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_SENDER_ID",

    appId:
        "YOUR_APP_ID"
};


const app =
    initializeApp(firebaseConfig);


export const auth =
    getAuth(app);


export const db =
    getFirestore(app);
```

> **หมายเหตุ:** ห้ามนำข้อมูลจริง เช่น API Key ที่มีข้อจำกัดไม่เหมาะสม, Service Account Key หรือ Secret ต่าง ๆ ไปเผยแพร่ใน Repository โดยไม่จำเป็น

---

# 🔑 Service Account

PHP API ใช้ Google Cloud Firestore Client ในการเชื่อมต่อ Firestore

ต้องมี Service Account สำหรับฝั่ง PHP

ไฟล์:

```text
config/serviceAccountKey.json
```

**ไม่ควร Commit ไฟล์นี้ขึ้น GitHub**

ควรเพิ่มใน `.gitignore`:

```gitignore
config/serviceAccountKey.json
```

และไฟล์อื่นที่เป็น Secret เช่น:

```gitignore
.env
*.key
*.pem
```

---

# ▶️ Running the Project

เนื่องจากระบบมี PHP API จึงควรเปิดผ่าน PHP Server แทนการเปิดด้วย Live Server

เปิด Terminal ที่ Project:

```bash
cd ~/Desktop/miniproject-cpetc-room-booking
```

จากนั้น:

```bash
php -S localhost:8000
```

ถ้าสำเร็จจะเห็นประมาณ:

```text
PHP Development Server
Listening on http://localhost:8000
```

จากนั้นเปิด:

```text
http://localhost:8000/
```

หรือหน้า Admin:

```text
http://localhost:8000/ADMIN/admin.html
```

---

# 🔄 API

ระบบจัดการห้องผ่าน PHP API

## Get Rooms

```text
GET
/api/rooms/list.php
```

ใช้สำหรับโหลดรายการห้อง

---

## Create Room

```text
POST
/api/rooms/create.php
```

ใช้สำหรับเพิ่มห้อง

ตัวอย่างข้อมูล:

```json
{
    "roomName": "CPE 613",
    "roomType": "Classroom",
    "capacity": 40,
    "building": "CPE",
    "equipment": "Projector",
    "status": "available"
}
```

---

## Update Room

```text
POST
/api/rooms/update.php
```

ตัวอย่าง:

```json
{
    "roomId": "ROOM_ID",
    "roomName": "CPE 613",
    "roomType": "Classroom",
    "capacity": 40,
    "building": "CPE",
    "equipment": "Projector",
    "status": "available"
}
```

---

## Delete Room

```text
POST
/api/rooms/delete.php
```

ตัวอย่าง:

```json
{
    "roomId": "ROOM_ID"
}
```

---

# 🧑‍💻 User Flow

การทำงานของผู้ใช้งาน:

```text
Register
   │
   ▼
Login
   │
   ▼
Dashboard
   │
   ▼
ดูรายการห้อง
   │
   ▼
เลือกห้อง
   │
   ▼
กรอกข้อมูลการจอง
   │
   ▼
ส่งคำขอ
   │
   ▼
Pending
   │
   ├──────────────┐
   ▼              ▼
Approved       Rejected
```

---

# 👨‍💼 Admin Flow

```text
Admin Login
     │
     ▼
Admin Dashboard
     │
     ├───────────────┐
     │               │
     ▼               ▼
Manage Users     Manage Rooms
     │               │
     │               ├── Add
     │               ├── Edit
     │               └── Delete
     │
     ▼
Manage Bookings
     │
     ├── Approve
     └── Reject
```

---

# 🗄️ Database Collections

## users

ใช้เก็บข้อมูลผู้ใช้งาน

| Field | Description |
|---|---|
| `name` | ชื่อผู้ใช้งาน |
| `email` | Email |
| `role` | สิทธิ์ผู้ใช้งาน |

Role:

```text
admin
user
```

---

## rooms

ใช้เก็บข้อมูลห้อง

| Field | Description |
|---|---|
| `roomName` | ชื่อห้อง |
| `roomType` | ประเภทห้อง |
| `capacity` | จำนวนคนที่รองรับ |
| `building` | อาคาร |
| `equipment` | อุปกรณ์ |
| `status` | สถานะห้อง |

---

## bookings

ใช้เก็บข้อมูลการจอง

| Field | Description |
|---|---|
| `userId` | UID ของผู้จอง |
| `roomId` | ID ห้อง |
| `roomName` | ชื่อห้อง |
| `bookingDate` | วันที่จอง |
| `startTime` | เวลาเริ่ม |
| `endTime` | เวลาสิ้นสุด |
| `people` | จำนวนผู้ใช้งาน |
| `status` | สถานะ |
| `createdAt` | วันที่สร้างรายการ |

---

# 🧪 Development

สำหรับการพัฒนาแนะนำ:

```text
Visual Studio Code
PHP
Composer
Firebase Console
Git
GitHub
```

หลังจากแก้ไขโค้ด:

```bash
git status
```

เพิ่มไฟล์:

```bash
git add .
```

Commit:

```bash
git commit -m "Update room booking system"
```

Push:

```bash
git push origin main
```

---

# 🌿 Git Workflow

แนะนำให้แยก Branch สำหรับการพัฒนา Feature:

```bash
git checkout -b feature/room-management
```

หลังแก้ไข:

```bash
git add .
git commit -m "Add room management"
git push origin feature/room-management
```

จากนั้นสามารถสร้าง Pull Request เพื่อรวมเข้ากับ `main`

---

# 📌 Project Status

ปัจจุบันระบบมีส่วนหลักดังนี้:

- [x] Firebase Authentication
- [x] User Login
- [x] User Registration
- [x] User Dashboard
- [x] Admin Dashboard
- [x] User Management
- [x] Room Management
- [x] Add Room
- [x] Edit Room
- [x] Delete Room
- [x] Room Status
- [x] Room Sorting
- [x] Booking System
- [x] Booking Request
- [x] Booking Approval
- [x] Booking Rejection
- [x] Firestore Database
- [x] PHP Firestore API

---

# 🔮 Future Improvements

ฟังก์ชันที่สามารถพัฒนาต่อได้:

- [ ] ตรวจสอบห้องว่างแบบ Real-time
- [ ] ป้องกันการจองเวลาซ้ำ
- [ ] ปฏิทินการจอง
- [ ] ระบบค้นหาห้อง
- [ ] Filter ห้องตามอาคาร
- [ ] Filter ห้องตามความจุ
- [ ] ระบบแจ้งเตือนเมื่อการจองได้รับการอนุมัติ
- [ ] ประวัติการจอง
- [ ] Dashboard Statistics
- [ ] รายงานการใช้งานห้อง
- [ ] Export รายงาน
- [ ] Responsive Design สำหรับ Mobile
- [ ] เพิ่มระบบ Audit Log สำหรับ Admin

---

# 👥 User Roles

| Role | Permission |
|---|---|
| `user` | ดูห้องและสร้างคำขอจอง |
| `admin` | จัดการ Users, Rooms และ Bookings |

---

# 🔒 Security Notes

โปรเจกต์นี้มีการใช้ Firebase และ Google Cloud Service Account ดังนั้นไม่ควรนำไฟล์ Secret ขึ้น GitHub

ไฟล์สำคัญที่ควรอยู่ใน `.gitignore`:

```gitignore
config/serviceAccountKey.json
.env
*.key
*.pem
```

หาก `serviceAccountKey.json` ถูกเผยแพร่ขึ้น GitHub แล้ว ควรสร้าง/เปลี่ยน Service Account Key ใหม่ทันที และนำ Key เดิมออกจากการใช้งาน

---

# 📚 Resources

- Firebase
- Cloud Firestore
- Firebase Authentication
- PHP
- Composer
- Google Cloud Firestore PHP Client
- Git
- GitHub

---

# 👨‍💻 Project

**Project:** CPETC Room Booking System

**Repository:**  
https://github.com/realgrizzly/miniproject-cpetc-room-booking

**Type:** Web Application / Mini Project

**Purpose:** ระบบจองและจัดการห้องภายในสถานศึกษา

---

# 📄 License

This project is developed for educational and academic purposes.
