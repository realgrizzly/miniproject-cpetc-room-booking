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
    message.textContent = "กรุณากรอกอีเมล";
    message.style.color = "#ef7777";
    return;
  }

  sendButton.disabled = true;
  sendButton.textContent = "กำลังส่ง...";
  message.textContent = "";

  try {
    await sendPasswordResetEmail(auth, email);

    message.style.color = "#6ed69b";
    message.textContent =
      "หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ กรุณาตรวจสอบกล่องจดหมายและอีเมลขยะ";

  } catch (error) {
    console.error(error);

    message.style.color = "#ef7777";

    if (error.code === "auth/invalid-email") {
      message.textContent = "รูปแบบอีเมลไม่ถูกต้อง";
    } else if (error.code === "auth/too-many-requests") {
      message.textContent =
        "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
    } else {
      message.textContent =
        "ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่";
    }
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "ส่งลิงก์รีเซ็ตรหัสผ่าน";
  }
});