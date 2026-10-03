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

# 👨‍💻 Project

**Project:** CPETC Room Booking System

**Repository:**  
https://github.com/realgrizzly/miniproject-cpetc-room-booking

**Type:** Web Application / Mini Project

**Purpose:** ระบบจองและจัดการห้องภายในสถานศึกษา

---

# 📄 License

This project is developed for educational and academic purposes.
