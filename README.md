# Miniproject CPETC Room Booking

## 📌 Project Overview
ระบบจองห้องออนไลน์สำหรับแผนกวิศวกรรมคอมพิวเตอร์ CPETC โดยแบ่งการใช้งานออกเป็น 2 ส่วนหลัก ได้แก่
- 👤 User — สามารถเข้าสู่ระบบ ดูห้อง และส่งคำขอจองห้อง
- 👨‍💼 Admin — สามารถจัดการผู้ใช้งาน ห้อง และอนุมัติหรือปฏิเสธคำขอจอง

ระบบใช้ Firebase Authentication สำหรับการเข้าสู่ระบบและจัดการบัญชีผู้ใช้งาน และใช้ Cloud Firestore เป็นฐานข้อมูลหลักของระบบในส่วนการจัดการข้อมูลห้อง ใช้ PHP API เชื่อมต่อกับ Cloud Firestore เพื่อให้ Admin สามารถเพิ่ม แก้ไข ลบ และโหลดข้อมูลห้องผ่านหน้าเว็บไซต์ได้

## ✨ Features
- 👤 Register / Login
- 🏫 ดูข้อมูลห้องและสถานะห้อง
- 📅 จองห้อง
- 📋 ตรวจสอบสถานะการจอง
- 👨‍💼 Admin จัดการผู้ใช้งาน
- 🏢 Admin เพิ่ม / แก้ไข / ลบห้อง
- ✅ Admin อนุมัติ / ปฏิเสธการจอง

## 🛠️ Technologies

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

```
---

## ⚙️ Requirements

ก่อนใช้งานควรติดตั้ง:

### PHP

แนะนำ PHP 8.x หรือใหม่กว่า

ตรวจสอบ PHP:

```bash
php -v
```

---

## Composer

ตรวจสอบ Composer:

```bash
composer -V
```

---

## Firebase

ต้องมี Firebase Project และเปิดใช้งาน:

- Firebase Authentication
- Cloud Firestore

---

## Google Cloud Firestore PHP Client

ติดตั้งด้วย Composer:

```bash
composer install
```

หรือ:

```bash
composer require google/cloud-firestore
```

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/realgrizzly/miniproject-cpetc-room-booking.git
```

เข้าสู่โฟลเดอร์:

```bash
cd miniproject-cpetc-room-booking
```

---

### 2. Install PHP Dependencies

```bash
composer install
```

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
