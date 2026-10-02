
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
} from "../../config/firebase-config.js";

// ==========================================
// LOAD USER DATA
// ==========================================

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let name = user.displayName || "ผู้ใช้งาน";
        let role = "user";

        if (userSnap.exists()) {
            const data = userSnap.data();
            name = data.name || name;
            role = data.role || "user";
        }

        const nameElement = document.getElementById("userName");
        const roleElement = document.getElementById("userRole");

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (roleElement) {
            roleElement.textContent =
                role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน";
        }

        console.log("โหลด Navbar สำเร็จ:", name, role);

    } catch (error) {
        console.error("โหลดข้อมูล Navbar ไม่สำเร็จ:", error);
    }
});

// ==========================================
// LOGOUT
// ==========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        if (!confirm("คุณต้องการออกจากระบบหรือไม่?")) {
            return;
        }

        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout Error:", error);
            alert("ไม่สามารถออกจากระบบได้ กรุณาลองใหม่");
        }
    });
} else {
    console.warn("ไม่พบปุ่ม logoutBtn ในหน้านี้");
}