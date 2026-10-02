// ==========================================
// FIREBASE
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "../config/firebase-config.js";


// ==========================================
// USER DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    loadUserData();
    loadBookingStats();
    setupLogout();

});


// ==========================================
// LOAD USER DATA
// ==========================================


function loadUserData() {
    onAuthStateChanged(auth, async function (user) {

        if (!user) {
            console.log("ยังไม่ได้เข้าสู่ระบบ");
            window.location.href = "../public/Login.html";
            return;
        }

        try {
            // ดึงข้อมูลผู้ใช้จาก Firebase
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            console.log("UID:", user.uid);
            console.log("พบเอกสาร:", userDoc.exists());

            let userName = user.displayName || "ผู้ใช้งาน";
            let userEmail = user.email || "-";
            let userRole = "user";

            if (userDoc.exists()) {
                const userData = userDoc.data();

                console.log("ข้อมูล Firestore:", userData);

                // ใช้ชื่อจาก Firestore ก่อน
                userName =
                    userData.name ||
                    user.displayName ||
                    "ผู้ใช้งาน";

                userEmail =
                    userData.email ||
                    user.email ||
                    "-";

                userRole = userData.role || "user";
            } else {
                console.warn("ไม่พบข้อมูลผู้ใช้ใน Firestore");
            }

            // แสดงชื่อใน Navbar
            const userNameElement =
                document.getElementById("userName");

            if (userNameElement) {
                userNameElement.textContent = userName;
            }

            // แสดงชื่อในส่วนต้อนรับ
            const welcomeName =
                document.getElementById("welcomeName");

            if (welcomeName) {
                welcomeName.textContent = userName;
            }

            // แสดงชื่อในข้อมูลบัญชี
            const profileName =
                document.getElementById("profileName");

            if (profileName) {
                profileName.textContent = userName;
            }

            // แสดงอีเมล
            const profileEmail =
                document.getElementById("profileEmail");

            if (profileEmail) {
                profileEmail.textContent = userEmail;
            }

            // แสดง Role
            const profileRole =
                document.getElementById("profileRole");

            if (profileRole) {
                profileRole.textContent =
                    userRole === "admin" ? "Admin" : "User";
            }

            // แสดงเมนู Admin เฉพาะ Admin
            const adminMenu =
                document.getElementById("adminMenu");

            if (adminMenu) {
                adminMenu.style.display =
                    userRole === "admin" ? "flex" : "none";
            }

            console.log("โหลดข้อมูล User สำเร็จ");

        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการโหลด User:", error);
        }
    });
}

// ==========================================
// BOOKING STATISTICS
// ==========================================

function loadBookingStats() {

    const totalBookings =
        document.getElementById("totalBookings");

    const upcomingBookings =
        document.getElementById("upcomingBookings");

    const cancelledBookings =
        document.getElementById("cancelledBookings");


    if (totalBookings) {

        totalBookings.textContent = "0";

    }


    if (upcomingBookings) {

        upcomingBookings.textContent = "0";

    }


    if (cancelledBookings) {

        cancelledBookings.textContent = "0";

    }

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutButton =
        document.getElementById("logoutBtn");


    if (!logoutButton) {

        return;

    }
}