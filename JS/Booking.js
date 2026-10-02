
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth, db } from "../config/firebase-config.js";

// ==========================================
// ตัวแปรหลัก
// ==========================================

let currentUser = null;
let selectedRoom = null;
let allRooms = [];

// ==========================================
// เริ่มต้นระบบ
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    setupLogout();
    setupBookingEvents();
    loadRooms();

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "../public/Login.html";
            return;
        }

        currentUser = user;

        try {
            const userSnap = await getDoc(
                doc(db, "users", user.uid)
            );

            let name = user.displayName || "ผู้ใช้งาน";
            let role = "user";

            if (userSnap.exists()) {
                const data = userSnap.data();
                name = data.name || name;
                role = data.role || "user";
            }

            const nameElement = document.getElementById("userName");
            const roleElement = document.getElementById("userRole");
            const adminMenu = document.getElementById("adminMenu");

            if (nameElement) {
                nameElement.textContent = name;
            }

            if (roleElement) {
                roleElement.textContent =
                    role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน";
            }

            if (adminMenu) {
                adminMenu.style.display =
                    role === "admin" ? "flex" : "none";
            }

            await loadBookingHistory();

        } catch (error) {
            console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
        }
    });
});

// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {
    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
        if (!confirm("คุณต้องการออกจากระบบหรือไม่?")) {
            return;
        }

        try {
            await signOut(auth);
            window.location.href = "../public/Login.html";
        } catch (error) {
            console.error("Logout Error:", error);
            alert("ไม่สามารถออกจากระบบได้");
        }
    });
}

// ==========================================
// โหลดห้องจาก Firestore
// ==========================================

async function loadRooms() {
    const roomGrid = document.getElementById("roomGrid");
    const roomCount = document.getElementById("roomCount");

    if (!roomGrid) return;

    roomGrid.innerHTML = `
        <div class="empty-room">กำลังโหลดข้อมูลห้อง...</div>
    `;

    try {
        const snapshot = await getDocs(collection(db, "rooms"));

        allRooms = snapshot.docs
            .map((roomDoc) => ({
                id: roomDoc.id,
                ...roomDoc.data()
            }))
            .sort((a, b) =>
                String(a.roomName || "").localeCompare(
                    String(b.roomName || ""),
                    "en",
                    { numeric: true, sensitivity: "base" }
                )
            );

        renderRooms(allRooms);

    } catch (error) {
        console.error("โหลดข้อมูลห้องไม่สำเร็จ:", error);
        roomGrid.innerHTML = `
            <div class="empty-room">
                ไม่สามารถโหลดข้อมูลห้องได้
            </div>
        `;
        if (roomCount) roomCount.textContent = "0";
    }
}

// ==========================================
// แปลงประเภทห้อง
// ==========================================

function getRoomTypeValue(type) {
    const value = String(type || "").toLowerCase();

    if (value === "meeting" || value.includes("ประชุม")) {
        return "meeting";
    }

    if (value === "computer" || value.includes("คอมพิวเตอร์")) {
        return "computer";
    }

    if (value === "lecture" || value.includes("เรียน")) {
        return "lecture";
    }

    if (value === "laboratory" || value.includes("ปฏิบัติการ")) {
        return "laboratory";
    }

    return "other";
}

// ==========================================
// สร้างรายการห้อง
// ==========================================

function renderRooms(rooms) {
    const roomGrid = document.getElementById("roomGrid");
    const roomCount = document.getElementById("roomCount");

    if (!roomGrid) return;

    roomGrid.innerHTML = "";

    const availableRooms = rooms.filter(
        room => room.status === "available"
    );

    if (roomCount) {
        roomCount.textContent = availableRooms.length;
    }

    if (availableRooms.length === 0) {
        roomGrid.innerHTML = `
            <div class="empty-room">
                ไม่พบห้องที่พร้อมใช้งาน
            </div>
        `;
        return;
    }

    availableRooms.forEach(room => {
        const card = document.createElement("article");
        card.className = "room-card";
        card.dataset.type = getRoomTypeValue(room.roomType);
        card.dataset.capacity = String(room.capacity || 0);

        let icon = "fa-door-open";
        const type = getRoomTypeValue(room.roomType);

        if (type === "meeting") icon = "fa-people-group";
        if (type === "computer") icon = "fa-computer";
        if (type === "lecture") icon = "fa-chalkboard";
        if (type === "laboratory") icon = "fa-flask";

        const image = document.createElement("div");
        image.className = "room-image";

        const roomIcon = document.createElement("i");
        roomIcon.className = `fa-solid ${icon}`;
        image.appendChild(roomIcon);

        const status = document.createElement("span");
        status.className = "room-status available";
        status.textContent = "ว่าง";
        image.appendChild(status);

        const content = document.createElement("div");
        content.className = "room-content";

        const title = document.createElement("div");
        title.className = "room-title";

        const heading = document.createElement("h3");
        heading.textContent = room.roomName || "-";

        const typeLabel = document.createElement("span");
        typeLabel.textContent = room.roomType || "-";

        title.append(heading, typeLabel);

        const details = document.createElement("div");
        details.className = "room-details";

        const capacity = document.createElement("div");
        const capacityIcon = document.createElement("i");
        capacityIcon.className = "fa-solid fa-users";
        const capacityText = document.createElement("span");
        capacityText.textContent = `${room.capacity || 0} คน`;
        capacity.append(capacityIcon, capacityText);

        const building = document.createElement("div");
        const buildingIcon = document.createElement("i");
        buildingIcon.className = "fa-solid fa-location-dot";
        const buildingText = document.createElement("span");
        buildingText.textContent = room.building || "-";
        building.append(buildingIcon, buildingText);

        details.append(capacity, building);

        const equipment = document.createElement("div");
        equipment.className = "equipment";

        const items = Array.isArray(room.equipment)
            ? room.equipment
            : String(room.equipment || "")
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

        if (items.length) {
            items.forEach(item => {
                const span = document.createElement("span");
                const check = document.createElement("i");
                check.className = "fa-solid fa-check";
                span.append(check, document.createTextNode(` ${item}`));
                equipment.appendChild(span);
            });
        } else {
            const span = document.createElement("span");
            span.textContent = "ไม่มีข้อมูลอุปกรณ์";
            equipment.appendChild(span);
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "select-room-button";
        button.dataset.roomId = room.id;
        button.dataset.room = room.roomName || "";
        button.dataset.capacity = String(room.capacity || 0);

        const buttonText = document.createElement("span");
        buttonText.textContent = "เลือกห้อง";

        const arrow = document.createElement("i");
        arrow.className = "fa-solid fa-arrow-right";

        button.append(buttonText, arrow);

        content.append(title, details, equipment, button);
        card.append(image, content);
        roomGrid.appendChild(card);
    });

    updateSelectedRoomStyle();
}

// ==========================================
// เลือกห้อง
// ==========================================



function selectRoom(button) {
    selectedRoom = {
        id: button.dataset.roomId,
        name: button.dataset.room,
        capacity: Number(button.dataset.capacity)
    };

    const modalRoom = document.getElementById("modalRoom");
    const peopleInput = document.getElementById("people");

    if (modalRoom) {
        modalRoom.textContent = selectedRoom.name;
    }

    if (peopleInput) {
        peopleInput.max = String(selectedRoom.capacity);
    }

    updateSelectedRoomStyle();
    updateSummary();

    // เปิดป๊อปอัปให้ตรงกับ CSS
    document.getElementById("confirmModal")
        ?.classList.add("active");
}

function updateSelectedRoomStyle() {
    document.querySelectorAll(".room-card").forEach(card => {
        const button = card.querySelector(".select-room-button");
        const isSelected =
            selectedRoom && button?.dataset.roomId === selectedRoom.id;

        card.classList.toggle("selected", Boolean(isSelected));

        if (button) {
            const span = button.querySelector("span");
            if (span) {
                span.textContent = isSelected ? "เลือกแล้ว" : "เลือกห้อง";
            }
        }
    });
}

// ==========================================
// ค้นหาห้อง
// ==========================================

function searchRooms() {
    const type = document.getElementById("roomType")?.value || "all";
    const people = Number(document.getElementById("people")?.value || 0);

    const filtered = allRooms.filter(room => {
        if (room.status !== "available") return false;

        const matchesType =
            type === "all" || getRoomTypeValue(room.roomType) === type;

        const matchesCapacity =
            !people || Number(room.capacity || 0) >= people;

        return matchesType && matchesCapacity;
    });

    if (
        selectedRoom &&
        !filtered.some(room => room.id === selectedRoom.id)
    ) {
        selectedRoom = null;
        resetSummaryRoom();
    }

    renderRooms(filtered);
}

// ==========================================
// สรุปข้อมูลการจอง
// ==========================================

function updateSummary() {
    const bookingDate = document.getElementById("bookingDate")?.value;
    const startTime = document.getElementById("startTime")?.value;
    const endTime = document.getElementById("endTime")?.value;
    const people = document.getElementById("people")?.value;

    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");
    const summaryPeople = document.getElementById("summaryPeople");

    if (summaryDate) {
        summaryDate.textContent = bookingDate || "-";
    }

    if (summaryTime) {
        summaryTime.textContent =
            startTime && endTime ? `${startTime} - ${endTime}` : "-";
    }

    if (summaryPeople) {
        summaryPeople.textContent = people ? `${people} คน` : "-";
    }
}

function resetSummaryRoom() {
    const summaryRoom = document.getElementById("summaryRoom");
    const peopleInput = document.getElementById("people");

    if (summaryRoom) {
        summaryRoom.textContent = "ยังไม่ได้เลือกห้อง";
    }

    if (peopleInput) {
        peopleInput.removeAttribute("max");
    }

    updateSelectedRoomStyle();
}

// ==========================================
// ตรวจสอบข้อมูลก่อนจอง
// ==========================================

function validateBooking() {
    const bookingDate = document.getElementById("bookingDate")?.value;
    const startTime = document.getElementById("startTime")?.value;
    const endTime = document.getElementById("endTime")?.value;
    const people = Number(document.getElementById("people")?.value);

    if (!selectedRoom) {
        alert("กรุณาเลือกห้องก่อน");
        return false;
    }

    if (!bookingDate) {
        alert("กรุณาเลือกวันที่จอง");
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${bookingDate}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
        alert("ไม่สามารถจองย้อนหลังได้");
        return false;
    }

    if (!startTime || !endTime) {
        alert("กรุณาเลือกเวลาเริ่มต้นและเวลาสิ้นสุด");
        return false;
    }

    if (startTime >= endTime) {
        alert("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
        return false;
    }

    if (!Number.isInteger(people) || people < 1) {
        alert("กรุณาระบุจำนวนผู้ใช้งานให้ถูกต้อง");
        return false;
    }

    if (people > selectedRoom.capacity) {
        alert(`ห้องนี้รองรับได้สูงสุด ${selectedRoom.capacity} คน`);
        return false;
    }

    return true;
}

// ==========================================
// เปิดและปิดหน้าต่างยืนยัน
// ==========================================


function openConfirmModal() {
    if (!selectedRoom) {
        alert("กรุณาเลือกห้องก่อน");
        return;
    }

    const modalRoom = document.getElementById("modalRoom");
    if (modalRoom) {
        modalRoom.textContent = selectedRoom.name;
    }

    document.getElementById("confirmModal")
        ?.classList.add("show");
}

function closeConfirmModal() {
    document.getElementById("confirmModal")?.classList.remove("show");
}

// ==========================================
// บันทึกการจอง
// ==========================================

async function confirmBooking() {
    if (!currentUser) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        return;
    }

    if (!validateBooking()) return;

    const button = document.getElementById("modalConfirm");

    try {
        if (button) button.disabled = true;

        await addDoc(collection(db, "bookings"), {
            userId: currentUser.uid,
            roomId: selectedRoom.id,
            roomName: selectedRoom.name,
            bookingDate: document.getElementById("bookingDate").value,
            startTime: document.getElementById("startTime").value,
            endTime: document.getElementById("endTime").value,
            people: Number(document.getElementById("people").value),
            status: "pending",
            createdAt: serverTimestamp()
        });

        alert("ส่งคำขอจองห้องสำเร็จ กรุณารอการอนุมัติ");

        closeConfirmModal();
        clearBookingForm();
        await loadBookingHistory();

    } catch (error) {
        console.error("บันทึกการจองไม่สำเร็จ:", error);
        alert("ไม่สามารถบันทึกการจองได้ กรุณาตรวจสอบ Firestore Rules");
    } finally {
        if (button) button.disabled = false;
    }
}

// ==========================================
// ล้างข้อมูล
// ==========================================

function clearBookingForm() {
    selectedRoom = null;

    const date = document.getElementById("bookingDate");
    const start = document.getElementById("startTime");
    const end = document.getElementById("endTime");
    const people = document.getElementById("people");
    const type = document.getElementById("roomType");

    if (date) date.value = "";
    if (start) start.value = "";
    if (end) end.value = "";
    if (people) {
        people.value = "";
        people.removeAttribute("max");
    }
    if (type) type.value = "all";

    resetSummaryRoom();
    updateSummary();
    renderRooms(allRooms);
}

// ==========================================
// ผูกปุ่มและช่องกรอกข้อมูล
// ==========================================

function setupBookingEvents() {
    const roomGrid = document.getElementById("roomGrid");

    // ใช้ Event Delegation สำหรับปุ่มเลือกห้อง
    roomGrid?.addEventListener("click", event => {
        const button = event.target.closest(".select-room-button");
        if (button) selectRoom(button);
    });

    document.getElementById("searchButton")
        ?.addEventListener("click", searchRooms);

    document.getElementById("confirmButton")
        ?.addEventListener("click", openConfirmModal);

    document.getElementById("modalCancel")
        ?.addEventListener("click", closeConfirmModal);

    document.querySelector(".modal-overlay")
        ?.addEventListener("click", closeConfirmModal);

    document.getElementById("modalConfirm")
        ?.addEventListener("click", confirmBooking);

    document.getElementById("clearButton")
        ?.addEventListener("click", clearBookingForm);

    ["bookingDate", "startTime", "endTime", "people"].forEach(id => {
        document.getElementById(id)
            ?.addEventListener("input", updateSummary);
    });

    const dateInput = document.getElementById("bookingDate");
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        dateInput.min = `${yyyy}-${mm}-${dd}`;
    }
}

// ==========================================
// โหลดประวัติการจองล่าสุด
// ==========================================

async function loadBookingHistory() {
    if (!currentUser) return;

    const tbody = document.getElementById("historyTableBody");
    if (!tbody) return;

    try {
        const bookingQuery = query(
            collection(db, "bookings"),
            where("userId", "==", currentUser.uid)
        );

        const snapshot = await getDocs(bookingQuery);
        tbody.innerHTML = "";

        if (snapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">ยังไม่มีประวัติการจอง</td>
                </tr>
            `;
            return;
        }

        const bookings = snapshot.docs
            .map(item => ({ id: item.id, ...item.data() }))
            .sort((a, b) =>
                String(b.bookingDate || "").localeCompare(
                    String(a.bookingDate || "")
                )
            )
            .slice(0, 5);

        bookings.forEach(booking => {
            const row = document.createElement("tr");

            const roomCell = document.createElement("td");
            const roomName = document.createElement("strong");
            roomName.textContent = booking.roomName || "-";
            roomCell.appendChild(roomName);

            const dateCell = document.createElement("td");
            dateCell.textContent = booking.bookingDate || "-";

            const timeCell = document.createElement("td");
            timeCell.textContent =
                `${booking.startTime || "-"} - ${booking.endTime || "-"}`;

            const peopleCell = document.createElement("td");
            peopleCell.textContent = `${booking.people || 0} คน`;

            const statusCell = document.createElement("td");
            const status = document.createElement("span");
            status.className = "history-status";

            if (booking.status === "approved") {
                status.classList.add("approved");
                status.textContent = "อนุมัติ";
            } else if (booking.status === "cancelled") {
                status.classList.add("cancelled");
                status.textContent = "ยกเลิก";
            } else {
                status.classList.add("pending");
                status.textContent = "รออนุมัติ";
            }

            statusCell.appendChild(status);

            const actionCell = document.createElement("td");
            actionCell.textContent = "-";

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

    } catch (error) {
        console.error("โหลดประวัติการจองไม่สำเร็จ:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">ไม่สามารถโหลดประวัติการจองได้</td>
            </tr>
        `;
    }
}