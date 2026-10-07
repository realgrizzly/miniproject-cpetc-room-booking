
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
    getDoc,
    updateDoc
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
                    <td colspan="6" class="empty-cell">
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
                <td colspan="6" class="empty-cell">
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

        // ปุ่มจัดการ
        const actionCell = document.createElement("td");
        actionCell.className = "booking-action-cell";

        if (canCancelBooking(booking)) {
            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "cancel-booking-btn";
            cancelButton.innerHTML =
                '<i class="fa-solid fa-ban"></i> ยกเลิก';

            cancelButton.addEventListener("click", () => {
                cancelBooking(booking, cancelButton);
            });

            actionCell.appendChild(cancelButton);
        } else if (booking.status === "cancelled") {
            const cancelledText = document.createElement("span");
            cancelledText.className = "action-done-text";
            cancelledText.innerHTML =
                '<i class="fa-solid fa-check"></i> ยกเลิกแล้ว';
            actionCell.appendChild(cancelledText);
        } else if (isBookingPast(booking)) {
            const pastText = document.createElement("span");
            pastText.className = "action-disabled-text";
            pastText.textContent = "เลยเวลา";
            actionCell.appendChild(pastText);
        } else {
            const noActionText = document.createElement("span");
            noActionText.className = "action-disabled-text";
            noActionText.textContent = "-";
            actionCell.appendChild(noActionText);
        }

        row.append(
            roomCell,
            dateCell,
            timeCell,
            peopleCell,
            statusCell,
            actionCell
        );

        tbody.appendChild(row);
    });
}

// ตรวจสอบว่า User สามารถยกเลิกได้หรือไม่
function canCancelBooking(booking) {
    const cancelableStatus =
        booking.status === "pending" ||
        booking.status === "approved";

    return cancelableStatus && !isBookingPast(booking);
}

// ตรวจสอบว่าถึงเวลาใช้งานไปแล้วหรือยัง
function isBookingPast(booking) {
    if (!booking.bookingDate) return false;

    const startTime = booking.startTime || "00:00";
    const bookingDateTime = new Date(
        `${booking.bookingDate}T${startTime}:00`
    );

    if (Number.isNaN(bookingDateTime.getTime())) {
        return false;
    }

    return bookingDateTime.getTime() <= Date.now();
}

// ยกเลิกการจอง
async function cancelBooking(booking, button) {
    if (!canCancelBooking(booking)) {
        alert("ไม่สามารถยกเลิกรายการจองนี้ได้");
        return;
    }

    const confirmCancel = confirm(
        `ต้องการยกเลิกการจอง ${booking.roomName || "ห้องนี้"} หรือไม่?\n\n` +
        `วันที่: ${formatDate(booking.bookingDate)}\n` +
        `เวลา: ${booking.startTime || "-"} - ${booking.endTime || "-"}`
    );

    if (!confirmCancel) return;

    try {
        button.disabled = true;
        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> กำลังยกเลิก...';

        await updateDoc(
            doc(db, "bookings", booking.id),
            {
                status: "cancelled"
            }
        );

        // อัปเดตข้อมูลในหน้าโดยไม่ต้องโหลดใหม่ทั้งหน้า
        booking.status = "cancelled";

        updateStats();
        renderBookings(getFilteredBookings());

        alert("ยกเลิกการจองเรียบร้อยแล้ว");

    } catch (error) {
        console.error("ยกเลิกการจองไม่สำเร็จ:", error);

        button.disabled = false;
        button.innerHTML =
            '<i class="fa-solid fa-ban"></i> ยกเลิก';

        alert(
            "ไม่สามารถยกเลิกการจองได้\n" +
            (error.message || "กรุณาลองใหม่อีกครั้ง")
        );
    }
}

// คืนรายการตามตัวกรองปัจจุบัน
function getFilteredBookings() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    const keyword = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const status = statusFilter
        ? statusFilter.value
        : "all";

    return allBookings.filter((booking) => {
        const roomName =
            (booking.roomName || "").toLowerCase();

        const matchName =
            roomName.includes(keyword);

        const matchStatus =
            status === "all" ||
            booking.status === status;

        return matchName && matchStatus;
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
    renderBookings(getFilteredBookings());
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
                <td colspan="6" class="empty-cell">
                    เกิดข้อผิดพลาดในการโหลดข้อมูล
                </td>
            </tr>
        `;
    }
}