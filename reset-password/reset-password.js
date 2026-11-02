import { auth } from "../config/firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const sendButton = document.getElementById("sendButton");
const message = document.getElementById("message");


form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        message.style.color = "#ef7777";
        message.textContent = "กรุณากรอก Gmail";
        return;
    }

    // รับเฉพาะ Gmail
    if (!email.toLowerCase().endsWith("@gmail.com")) {
        message.style.color = "#ef7777";
        message.textContent = "กรุณาใช้ Gmail เท่านั้น";
        return;
    }


    sendButton.disabled = true;
    sendButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่ง...';

    message.textContent = "";


    try {

        console.log("กำลังส่ง Reset Password ไปที่:", email);

        await sendPasswordResetEmail(auth, email);

        console.log("Firebase รับคำขอ Reset Password แล้ว");


        message.style.color = "#6ed69b";

        message.textContent =
            "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบ Gmail และโฟลเดอร์ Spam";


    } catch (error) {

        console.error("================================");
        console.error("RESET PASSWORD ERROR");
        console.error("CODE:", error.code);
        console.error("MESSAGE:", error.message);
        console.error(error);
        console.error("================================");


        message.style.color = "#ef7777";


        switch (error.code) {

            case "auth/invalid-email":

                message.textContent =
                    "รูปแบบ Gmail ไม่ถูกต้อง";

                break;


            case "auth/user-not-found":

                message.textContent =
                    "ไม่พบบัญชี Gmail นี้ใน Firebase Authentication";

                break;


            case "auth/too-many-requests":

                message.textContent =
                    "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";

                break;


            case "auth/network-request-failed":

                message.textContent =
                    "เชื่อมต่อ Firebase ไม่สำเร็จ กรุณาตรวจสอบ Internet";

                break;


            case "auth/operation-not-allowed":

                message.textContent =
                    "Firebase ยังไม่ได้เปิด Email/Password Authentication";

                break;


            default:

                message.textContent =
                    `ส่งไม่สำเร็จ: ${error.code || error.message}`;

                break;
        }

    } finally {

        sendButton.disabled = false;

        sendButton.innerHTML =
            "ส่งลิงก์รีเซ็ตรหัสผ่าน";
    }

});