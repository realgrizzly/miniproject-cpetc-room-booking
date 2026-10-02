
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth, db } from "../config/firebase-config.js";

let allBookings = [];

// ตรวจสอบผู้ใช้
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../public/Login.html";
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            document.getElementById("userName").textContent =
                userData.name || "ผู้ใช้งาน";

            if (userData.role === "admin") {
                document.getElementById("adminMenu").style.display = "flex";
            }
        }

        await loadHistory(user.uid);

    } catch (error) {
        console.error("โหลดประวัติไม่สำเร็จ:", error);
        showError();
    }
});

// โหลดประวัติการจอง
async function loadHistory(uid) {
    const tbody = document.getElementById("historyTableBody");

    try {
        const bookingQuery = query(
            collection(db, "bookings"),
            where("userId", "==", uid)
        );

        const snapshot = await getDocs(bookingQuery);

        allBookings = snapshot.docs.map((bookingDoc) => ({
            id: bookingDoc.id,
            ...bookingDoc.data()
        }));

        // เรียงวันที่จองจากใหม่ไปเก่า
        allBookings.sort((a, b) => {
            const dateA = `${a.bookingDate || ""} ${a.startTime || ""}`;
            const dateB = `${b.bookingDate || ""} ${b.startTime || ""}`;
            return dateB.localeCompare(dateA);
        });

        updateStats();
        renderBookings(allBookings);

    } catch (error) {
        console.error("Firestore Error:", error);

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-cell">
                        ไม่สามารถโหลดประวัติการจองได้
                    </td>
                </tr>
            `;
        }
    }
}

// แปลงสถานะ
function getStatus(status) {
    const statuses = {
        pending: {
            text: "รออนุมัติ",
            className: "status-pending"
        },
        approved: {
            text: "อนุมัติแล้ว",
            className: "status-approved"
        },
        rejected: {
            text: "ปฏิเสธ",
            className: "status-rejected"
        },
        cancelled: {
            text: "ยกเลิก",
            className: "status-cancelled"
        }
    };

    return statuses[status] || {
        text: status || "ไม่ระบุ",
        className: "status-unknown"
    };
}

// อัปเดตสถิติ
function updateStats() {
    document.getElementById("totalCount").textContent =
        allBookings.length;

    document.getElementById("pendingCount").textContent =
        allBookings.filter(b => b.status === "pending").length;

    document.getElementById("approvedCount").textContent =
        allBookings.filter(b => b.status === "approved").length;

    document.getElementById("cancelledCount").textContent =
        allBookings.filter(
            b => b.status === "rejected" || b.status === "cancelled"
        ).length;
}

// แสดงตาราง
function renderBookings(bookings) {
    const tbody = document.getElementById("historyTableBody");
    const resultCount = document.getElementById("resultCount");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (resultCount) {
        resultCount.textContent = `${bookings.length} รายการ`;
    }

    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    ไม่พบประวัติการจอง
                </td>
            </tr>
        `;
        return;
    }

    bookings.forEach((booking) => {
        const row = document.createElement("tr");

        const roomCell = document.createElement("td");
        roomCell.className = "room-name";
        roomCell.textContent = booking.roomName || "ไม่ระบุชื่อห้อง";

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(booking.bookingDate);

        const timeCell = document.createElement("td");
        timeCell.textContent =
            `${booking.startTime || "-"} - ${booking.endTime || "-"}`;

        const peopleCell = document.createElement("td");
        peopleCell.textContent =
            booking.people != null ? `${booking.people} คน` : "-";

        const statusCell = document.createElement("td");
        const status = getStatus(booking.status);

        const badge = document.createElement("span");
        badge.className = `status-badge ${status.className}`;
        badge.textContent = status.text;

        statusCell.appendChild(badge);

        row.append(
            roomCell,
            dateCell,
            timeCell,
            peopleCell,
            statusCell
        );

        tbody.appendChild(row);
    });
}

// แสดงวันที่
function formatDate(date) {
    if (!date) return "-";

    // รองรับรูปแบบ YYYY-MM-DD
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return date;
}

// ค้นหาและกรอง
function filterBookings() {
    const keyword = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const status = document.getElementById("statusFilter").value;

    const filtered = allBookings.filter((booking) => {
        const roomName = (booking.roomName || "").toLowerCase();

        const matchName = roomName.includes(keyword);
        const matchStatus = status === "all" || booking.status === status;

        return matchName && matchStatus;
    });

    renderBookings(filtered);
}

document.getElementById("searchInput")
    .addEventListener("input", filterBookings);

document.getElementById("statusFilter")
    .addEventListener("change", filterBookings);

document.getElementById("resetFilter")
    .addEventListener("click", () => {
        document.getElementById("searchInput").value = "";
        document.getElementById("statusFilter").value = "all";
        filterBookings();
    });

// ออกจากระบบ
document.getElementById("logoutButton")
    .addEventListener("click", async () => {
        if (!confirm("คุณต้องการออกจากระบบหรือไม่?")) return;

        try {
            await signOut(auth);
            window.location.href = "../public/Login.html";
        } catch (error) {
            console.error("Logout Error:", error);
            alert("ไม่สามารถออกจากระบบได้");
        }
    });

// แสดงข้อผิดพลาด
function showError() {
    const tbody = document.getElementById("historyTableBody");

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    เกิดข้อผิดพลาดในการโหลดข้อมูล
                </td>
            </tr>
        `;
    }
}