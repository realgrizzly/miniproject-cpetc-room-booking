
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


import { auth, db } from "../config/firebase-config.js";

// =====================================
// ตัวแปรระบบ
// =====================================

let allUsers = [];
let editingRoomId = null;

// =====================================
// ตรวจสอบสิทธิ์ Admin
// =====================================

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "../public/Login.html";
        return;
    }

    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            alert("ไม่พบข้อมูลผู้ใช้งาน");
            await signOut(auth);
            window.location.href = "../public/Login.html";
            return;
        }

        const userData = userDoc.data();

        if (userData.role !== "admin") {
            alert("คุณไม่มีสิทธิ์เข้าสู่หน้า Admin");
            window.location.href = "../public/Dashboard.html";
            return;
        }

        const adminName = document.getElementById("adminName");
        if (adminName) {
            adminName.textContent = userData.name || "Admin";
        }

        await Promise.all([
            loadUsers(),
            loadRooms()
        ]);

    } catch (error) {
        console.error("Admin Error:", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
});

// =====================================
// จัดการผู้ใช้งาน
// =====================================


// ===============================
// โหลดและจัดการ User ทั้งหมด
// ===============================


async function loadUsers() {
    try {
        const usersSnapshot = await getDocs(
            collection(db, "users")
        );

        const adminTableBody =
            document.getElementById("adminTableBody");
        const userTableBody =
            document.getElementById("userTableBody");

        const adminCount =
            document.getElementById("adminCount");
        const userCount =
            document.getElementById("userCount");

        if (!adminTableBody || !userTableBody) return;

        adminTableBody.innerHTML = "";
        userTableBody.innerHTML = "";

        const admins = [];
        const users = [];

        usersSnapshot.forEach((userDoc) => {
            const user = userDoc.data();
            const item = { id: userDoc.id, ...user };

            if (user.role === "admin") {
                admins.push(item);
            } else {
                users.push(item);
            }
        });

        if (adminCount) {
            adminCount.textContent = `${admins.length} คน`;
        }
        if (userCount) {
            userCount.textContent = `${users.length} คน`;
        }

        function renderRows(list, tbody, isAdmin) {
            if (list.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            ${isAdmin
                                ? "ยังไม่มีผู้ดูแลระบบ"
                                : "ยังไม่มีผู้ใช้งานทั่วไป"}
                        </td>
                    </tr>
                `;
                return;
            }

            list.forEach((user) => {
                const isSelf =
                    auth.currentUser?.uid === user.id;

                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.textContent = user.name || "-";

                const emailCell = document.createElement("td");
                emailCell.textContent = user.email || "-";

                const roleCell = document.createElement("td");
                roleCell.textContent = isAdmin ? "Admin" : "User";

                const actionCell = document.createElement("td");
                actionCell.className = "user-actions";

                const roleButton = document.createElement("button");
                roleButton.type = "button";
                roleButton.className =
                    "btn btn-secondary change-role-btn";
                roleButton.textContent =
                    isAdmin ? "เปลี่ยนเป็น User" : "เปลี่ยนเป็น Admin";
                roleButton.dataset.uid = user.id;
                roleButton.dataset.role =
                    isAdmin ? "user" : "admin";
                roleButton.disabled = isSelf;

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.className = "btn btn-edit edit-user-btn";
                editButton.textContent = "แก้ไข";
                editButton.dataset.uid = user.id;
                editButton.dataset.name = user.name || "";

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.className = "btn btn-delete delete-user-btn";
                deleteButton.textContent = "ลบ";
                deleteButton.dataset.uid = user.id;
                deleteButton.disabled = isSelf;

                actionCell.append(
                    roleButton,
                    editButton,
                    deleteButton
                );

                row.append(
                    nameCell,
                    emailCell,
                    roleCell,
                    actionCell
                );

                tbody.appendChild(row);
            });
        }

        renderRows(admins, adminTableBody, true);
        renderRows(users, userTableBody, false);

    } catch (error) {
        console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ:", error);
        alert("ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
    }
}


// ===============================
// ค้นหาผู้ใช้งานทั่วไป
// ===============================

const userSearch =
    document.getElementById("userSearch");

if (userSearch) {
    userSearch.addEventListener("input", () => {
        const keyword = userSearch.value
            .trim()
            .toLowerCase();

        document.querySelectorAll(
            "#userTableBody tr"
        ).forEach((row) => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(keyword)
                ? ""
                : "none";
        });
    });
}


// ===============================
// ปุ่มจัดการผู้ใช้
// ===============================

document.addEventListener("click", async (event) => {
    const button = event.target.closest(
        ".change-role-btn, .edit-user-btn, .delete-user-btn"
    );

    if (!button) return;

    const userId = button.dataset.uid;

    if (auth.currentUser?.uid === userId) {
        alert("ไม่สามารถจัดการบัญชีตัวเองได้");
        return;
    }

    try {
        button.disabled = true;

        if (button.classList.contains("change-role-btn")) {
            const newRole = button.dataset.role;
            const roleName =
                newRole === "admin" ? "Admin" : "User";

            if (!confirm(`ต้องการเปลี่ยนเป็น ${roleName} หรือไม่?`)) {
                button.disabled = false;
                return;
            }

            await updateDoc(doc(db, "users", userId), {
                role: newRole
            });

            alert("เปลี่ยนสิทธิ์สำเร็จ");
        }

        if (button.classList.contains("delete-user-btn")) {
            if (!confirm(
                "ยืนยันลบข้อมูลโปรไฟล์ผู้ใช้นี้หรือไม่?"
            )) {
                button.disabled = false;
                return;
            }

            await deleteDoc(doc(db, "users", userId));
            alert("ลบข้อมูลโปรไฟล์สำเร็จ");
        }

        await loadUsers();

    } catch (error) {
        console.error("จัดการผู้ใช้ไม่สำเร็จ:", error);
        alert("ดำเนินการไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firestore");
        button.disabled = false;
    }
});


// ===============================
// จัดการปุ่มในตารางผู้ใช้
// ===============================

const userTableBody =
    document.getElementById("userTableBody");

if (userTableBody) {
    userTableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("button");
        if (!button) return;

        const userId = button.dataset.uid;

        // ห้ามจัดการบัญชีตัวเอง
        if (
            auth.currentUser &&
            userId === auth.currentUser.uid
        ) {
            alert("ไม่สามารถจัดการบัญชีตัวเองได้");
            return;
        }

        // ===============================
        // แก้ไขชื่อผู้ใช้
        // ===============================

        if (button.classList.contains("edit-user-btn")) {
            const oldName = button.dataset.name || "";

            const newName = prompt(
                "กรุณากรอกชื่อผู้ใช้ใหม่",
                oldName
            );

            if (newName === null) return;

            const name = newName.trim();

            if (!name) {
                alert("กรุณากรอกชื่อผู้ใช้");
                return;
            }

            if (name.length > 100) {
                alert("ชื่อผู้ใช้ต้องไม่เกิน 100 ตัวอักษร");
                return;
            }

            if (name === oldName) return;

            try {
                button.disabled = true;

                await updateDoc(
                    doc(db, "users", userId),
                    { name }
                );

                alert("แก้ไขชื่อผู้ใช้สำเร็จ");
                await loadUsers();

            } catch (error) {
                console.error("แก้ไขชื่อไม่สำเร็จ:", error);
                alert("ไม่สามารถแก้ไขชื่อได้");
                button.disabled = false;
            }
        }

        // ===============================
        // เปลี่ยน Role
        // ===============================

        if (button.classList.contains("change-role-btn")) {
            const newRole = button.dataset.role;

            const roleName =
                newRole === "admin" ? "Admin" : "User";

            const confirmed = confirm(
                `ต้องการเปลี่ยนบัญชีนี้เป็น ${roleName} หรือไม่?`
            );

            if (!confirmed) return;

            try {
                button.disabled = true;

                await updateDoc(
                    doc(db, "users", userId),
                    { role: newRole }
                );

                await loadUsers();

            } catch (error) {
                console.error("เปลี่ยน Role ไม่สำเร็จ:", error);
                alert("ไม่สามารถเปลี่ยน Role ได้");
                button.disabled = false;
            }
        }

        // ===============================
        // ลบข้อมูลผู้ใช้จาก Firestore
        // ===============================

        if (button.classList.contains("delete-user-btn")) {
            const confirmed = confirm(
                "ต้องการลบข้อมูลโปรไฟล์ผู้ใช้นี้หรือไม่?\n\n" +
                "การลบนี้ไม่สามารถย้อนกลับได้ และจะไม่ลบบัญชี Firebase Authentication"
            );

            if (!confirmed) return;

            try {
                button.disabled = true;

                await deleteDoc(
                    doc(db, "users", userId)
                );

                alert("ลบข้อมูลโปรไฟล์สำเร็จ");
                await loadUsers();

            } catch (error) {
                console.error("ลบข้อมูลไม่สำเร็จ:", error);
                alert("ไม่สามารถลบข้อมูลได้");
                button.disabled = false;
            }
        }
    });
}

// =====================================
// จัดการห้อง
// =====================================

// โหลดรายการห้อง
async function loadRooms() {
    const tbody = document.getElementById("roomTableBody");

    try {
        const snapshot = await getDocs(collection(db, "rooms"));

        const roomCount = document.getElementById("roomCount");
        if (roomCount) {
            roomCount.textContent = `${snapshot.size} ห้อง`;
        }

        if (!tbody) return;

        tbody.innerHTML = "";

        if (snapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-room">
                            ยังไม่มีข้อมูลห้อง
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        snapshot.forEach(roomDoc => {
            const room = roomDoc.data();

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = room.roomName || "-";

            const typeCell = document.createElement("td");
            typeCell.textContent = room.roomType || "-";

            const capacityCell = document.createElement("td");
            capacityCell.textContent =
                `${room.capacity ?? 0} คน`;

            const buildingCell = document.createElement("td");
            buildingCell.textContent = room.building || "-";

            const statusCell = document.createElement("td");
            const statusSpan = document.createElement("span");

            const isAvailable = room.status === "available";

            statusSpan.className = isAvailable
                ? "status status-available"
                : "status status-unavailable";

            statusSpan.textContent = isAvailable
                ? "พร้อมใช้งาน"
                : "ไม่พร้อมใช้งาน";

            statusCell.appendChild(statusSpan);

            const actionCell = document.createElement("td");
            const actionButtons = document.createElement("div");
            actionButtons.className = "action-buttons";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "action-btn edit-btn";
            editButton.dataset.id = roomDoc.id;
            editButton.textContent = "แก้ไข";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.dataset.id = roomDoc.id;
            deleteButton.textContent = "ลบ";

            actionButtons.append(editButton, deleteButton);
            actionCell.appendChild(actionButtons);

            row.append(
                nameCell,
                typeCell,
                capacityCell,
                buildingCell,
                statusCell,
                actionCell
            );

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("โหลดข้อมูลห้องไม่สำเร็จ:", error);

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-room">
                            ไม่สามารถโหลดข้อมูลห้องได้
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// =====================================
// เพิ่มและแก้ไขห้อง
// =====================================

async function addRoom() {
    const roomName = document.getElementById("roomName").value.trim();
    const roomType = document.getElementById("roomType").value;
    const capacityInput = document.getElementById("capacity").value;
    const capacity = Number(capacityInput);
    const building = document.getElementById("building").value.trim();
    const equipment = document.getElementById("equipment").value.trim();
    const status = document.getElementById("status").value;

    if (!roomName || !roomType || !capacityInput || !building) {
        alert("กรุณากรอกข้อมูลห้องให้ครบ");
        return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
        alert("กรุณากรอกความจุตั้งแต่ 1 คนขึ้นไป");
        return;
    }

    const saveButton = document.getElementById("saveRoomButton");

    try {
        if (saveButton) saveButton.disabled = true;

        const roomData = {
            roomName,
            roomType,
            capacity,
            building,
            equipment,
            status
        };

        if (editingRoomId) {
            // แก้ไขห้องเดิม
            await updateDoc(
                doc(db, "rooms", editingRoomId),
                roomData
            );

            alert("แก้ไขข้อมูลห้องสำเร็จ");

        } else {
            // เพิ่มห้องใหม่
            await addDoc(collection(db, "rooms"), {
                ...roomData,
                createdAt: serverTimestamp()
            });

            alert("เพิ่มห้องสำเร็จ");
        }

        clearRoomForm();
        await loadRooms();

    } catch (error) {
        console.error("บันทึกห้องไม่สำเร็จ:", error);
        alert("ไม่สามารถบันทึกข้อมูลห้องได้");
    } finally {
        if (saveButton) saveButton.disabled = false;
    }
}

// =====================================
// แก้ไขห้อง
// =====================================

async function editRoom(roomId) {
    try {
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
            alert("ไม่พบข้อมูลห้องนี้");
            await loadRooms();
            return;
        }

        const room = roomDoc.data();

        document.getElementById("roomName").value =
            room.roomName || "";

        document.getElementById("roomType").value =
            room.roomType || "";

        document.getElementById("capacity").value =
            room.capacity ?? "";

        document.getElementById("building").value =
            room.building || "";

        document.getElementById("equipment").value =
            room.equipment || "";

        document.getElementById("status").value =
            room.status || "available";

        editingRoomId = roomId;

        const saveButton = document.getElementById("saveRoomButton");
        if (saveButton) {
            saveButton.textContent = "บันทึกการแก้ไข";
        }

        document.querySelector(".room-form-card")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    } catch (error) {
        console.error("โหลดห้องเพื่อแก้ไขไม่สำเร็จ:", error);
        alert("ไม่สามารถโหลดข้อมูลห้องได้");
    }
}

// =====================================
// ลบห้อง
// =====================================

async function deleteRoom(roomId) {
    if (!confirm("ต้องการลบห้องนี้ใช่หรือไม่?\nการลบไม่สามารถย้อนกลับได้")) {
        return;
    }

    try {
        await deleteDoc(doc(db, "rooms", roomId));

        if (editingRoomId === roomId) {
            clearRoomForm();
        }

        alert("ลบห้องสำเร็จ");
        await loadRooms();

    } catch (error) {
        console.error("ลบห้องไม่สำเร็จ:", error);
        alert("ไม่สามารถลบห้องได้");
    }
}

// จัดการปุ่มแก้ไขและลบห้อง
const roomTableBody = document.getElementById("roomTableBody");

if (roomTableBody) {
    roomTableBody.addEventListener("click", function (event) {
        const editButton = event.target.closest(".edit-btn");
        const deleteButton = event.target.closest(".delete-btn");

        if (editButton) {
            editRoom(editButton.dataset.id);
        }

        if (deleteButton) {
            deleteRoom(deleteButton.dataset.id);
        }
    });
}

// =====================================
// ล้างฟอร์ม
// =====================================

function clearRoomForm() {
    document.getElementById("roomName").value = "";
    document.getElementById("roomType").value = "";
    document.getElementById("capacity").value = "";
    document.getElementById("building").value = "";
    document.getElementById("equipment").value = "";
    document.getElementById("status").value = "available";

    editingRoomId = null;

    const saveButton = document.getElementById("saveRoomButton");
    if (saveButton) {
        saveButton.textContent = "+ เพิ่มห้อง";
    }
}

// ปุ่มเพิ่มหรือบันทึกการแก้ไข
const saveRoomButton = document.getElementById("saveRoomButton");

if (saveRoomButton) {
    saveRoomButton.addEventListener("click", addRoom);
}

// ปุ่มล้างข้อมูล
const clearRoomButton = document.getElementById("clearRoomButton");

if (clearRoomButton) {
    clearRoomButton.addEventListener("click", clearRoomForm);
}

// =====================================
// ออกจากระบบ
// =====================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async function () {
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