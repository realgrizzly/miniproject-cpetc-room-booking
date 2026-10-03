# Miniproject CPETC Room Booking

### 📌 Project Overview
ระบบจองห้องออนไลน์สำหรับแผนกวิศวกรรมคอมพิวเตอร์ CPETC โดยแบ่งการใช้งานออกเป็น 2 ส่วนหลัก ได้แก่
- 👤 User — สามารถเข้าสู่ระบบ ดูห้อง และส่งคำขอจองห้อง
- 👨‍💼 Admin — สามารถจัดการผู้ใช้งาน ห้อง และอนุมัติหรือปฏิเสธคำขอจอง

ระบบใช้ Firebase Authentication สำหรับการเข้าสู่ระบบและจัดการบัญชีผู้ใช้งาน และใช้ Cloud Firestore เป็นฐานข้อมูลหลักของระบบ
ในส่วนการจัดการข้อมูลห้อง ใช้ PHP API เชื่อมต่อกับ Cloud Firestore เพื่อให้ Admin สามารถเพิ่ม แก้ไข ลบ และโหลดข้อมูลห้องผ่านหน้าเว็บไซต์ได้

### ✨ Features
- 👤 Register / Login
- 🏫 ดูข้อมูลห้องและสถานะห้อง
- 📅 จองห้อง
- 📋 ตรวจสอบสถานะการจอง
- 👨‍💼 Admin จัดการผู้ใช้งาน
- 🏢 Admin เพิ่ม / แก้ไข / ลบห้อง
- ✅ Admin อนุมัติ / ปฏิเสธการจอง

### 🛠️ Technologies
- HTML
- CSS
- JavaScript
- PHP
- Firebase Authentication
- Cloud Firestore
- Composer
