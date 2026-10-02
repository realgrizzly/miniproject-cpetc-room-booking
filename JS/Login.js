// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { auth } from "../config/firebase-config.js";


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


if (togglePassword) {

    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            this.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

            this.setAttribute(
                "aria-label",
                "ซ่อนรหัสผ่าน"
            );

        } else {

            passwordInput.type = "password";

            this.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

            this.setAttribute(
                "aria-label",
                "แสดงรหัสผ่าน"
            );

        }

    });

}


// ==========================================
// LOGIN FORM
// ==========================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        // ==========================================
        // ตรวจสอบข้อมูล
        // ==========================================

        if (!email || !password) {

            alert("กรุณากรอกอีเมลและรหัสผ่าน");

            return;
        }


        try {

            // ==========================================
            // LOGIN ด้วย Firebase Authentication
            // ==========================================

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            // ==========================================
            // Login สำเร็จ
            // ==========================================

            alert("เข้าสู่ระบบสำเร็จ !");

            window.location.href =
                "../Public/Dashboard.html";


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            // ==========================================
            // จัดการ Error
            // ==========================================

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {

                alert(
                    "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
                );

            } else if (
                error.code === "auth/invalid-email"
            ) {

                alert(
                    "รูปแบบอีเมลไม่ถูกต้อง"
                );

            } else if (
                error.code === "auth/too-many-requests"
            ) {

                alert(
                    "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ภายหลัง"
                );

            } else {

                alert(
                    "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"
                );

            }

        }

    }
);