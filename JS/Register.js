
import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth, db } from "../config/firebase-config.js";

// ========================================
// 1. แสดง / ซ่อนรหัสผ่าน
// ========================================

function setupPasswordToggle(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener("click", function () {
        const showPassword = input.type === "password";

        input.type = showPassword ? "text" : "password";

        button.innerHTML = showPassword
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';

        button.setAttribute(
            "aria-label",
            showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
        );
    });
}

setupPasswordToggle("password", "togglePassword");
setupPasswordToggle("confirmPassword", "toggleConfirmPassword");


// ========================================
// 2. ระบบ Pop-up เงื่อนไขการใช้งาน
// ========================================

const termsCheckbox = document.getElementById("terms");
const termsModal = document.getElementById("termsModal");
const acceptButton = document.getElementById("acceptTerms");
const cancelButton = document.getElementById("cancelTerms");
const closeButton = document.getElementById("closeTerms");

let termsAccepted = false;

// เริ่มต้นซ่อน Pop-up
if (termsModal) {
    termsModal.style.display = "none";
}

// เปิด Pop-up
function openTerms() {
    if (!termsModal) return;

    termsModal.style.display = "flex";
}

// ปิด Pop-up
function closeTerms() {
    if (!termsModal) return;

    termsModal.style.display = "none";
}

// เมื่อกดช่องยอมรับเงื่อนไข
if (termsCheckbox) {
    termsCheckbox.addEventListener("change", function () {
        if (this.checked && !termsAccepted) {
            // ยังไม่ได้ยอมรับ ให้แสดง Pop-up
            this.checked = false;
            openTerms();
        } else if (!this.checked) {
            termsAccepted = false;
        }
    });
}

// เมื่อกดยอมรับใน Pop-up
if (acceptButton) {
    acceptButton.addEventListener("click", function () {
        termsAccepted = true;

        if (termsCheckbox) {
            termsCheckbox.checked = true;
        }

        closeTerms();
    });
}

// เมื่อกดปิดหรือยกเลิก
if (cancelButton) {
    cancelButton.addEventListener("click", function () {
        termsAccepted = false;

        if (termsCheckbox) {
            termsCheckbox.checked = false;
        }

        closeTerms();
    });
}

if (closeButton) {
    closeButton.addEventListener("click", function () {
        termsAccepted = false;

        if (termsCheckbox) {
            termsCheckbox.checked = false;
        }

        closeTerms();
    });
}

// เมื่อคลิกพื้นที่ Overlay
const termsOverlay = termsModal?.querySelector(".terms-overlay");

if (termsOverlay) {
    termsOverlay.addEventListener("click", function () {
        termsAccepted = false;

        if (termsCheckbox) {
            termsCheckbox.checked = false;
        }

        closeTerms();
    });
}

// กด Escape เพื่อปิด Pop-up
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && termsModal) {
        if (termsModal.style.display !== "none") {
            termsAccepted = false;

            if (termsCheckbox) {
                termsCheckbox.checked = false;
            }

            closeTerms();
        }
    }
});


// ========================================
// 3. สมัครสมาชิก Firebase
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // ตรวจสอบชื่อ
        if (!name) {
            alert("กรุณากรอกชื่อ - นามสกุล");
            return;
        }

        // ตรวจสอบอีเมล
        if (!email) {
            alert("กรุณากรอกอีเมล");
            return;
        }

        // ตรวจสอบรหัสผ่าน
        if (!password || !confirmPassword) {
            alert("กรุณากรอกรหัสผ่านให้ครบ");
            return;
        }

        if (password.length < 8) {
            alert("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
            return;
        }

        if (password !== confirmPassword) {
            alert("รหัสผ่านไม่ตรงกัน");
            return;
        }

        // ตรวจสอบการยอมรับเงื่อนไข
        if (!termsAccepted || !termsCheckbox?.checked) {
            alert("กรุณาอ่านและยอมรับเงื่อนไขการใช้งาน");
            return;
        }

        const submitButton = registerForm.querySelector(
            'button[type="submit"]'
        );

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML =
                    '<span>กำลังสมัครสมาชิก...</span>';
            }

            // สมัครสมาชิกด้วย Firebase Authentication
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // บันทึกข้อมูลผู้ใช้ลง Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: "user",
                createdAt: serverTimestamp()
            });

            alert("สมัครสมาชิกสำเร็จ!");

            window.location.href = "../public/Login.html";

        } catch (error) {
            console.error("Register Error:", error);

            if (error.code === "auth/email-already-in-use") {
                alert("อีเมลนี้ถูกใช้งานแล้ว");

            } else if (error.code === "auth/invalid-email") {
                alert("รูปแบบอีเมลไม่ถูกต้อง");

            } else if (error.code === "auth/weak-password") {
                alert("รหัสผ่านอ่อนเกินไป");

            } else if (error.code === "auth/network-request-failed") {
                alert("ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้");

            } else {
                alert("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML =
                    '<span>สมัครสมาชิก</span>' +
                    '<i class="fa-solid fa-arrow-right"></i>';
            }
        }
    });
}