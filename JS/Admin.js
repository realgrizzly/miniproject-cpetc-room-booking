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
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { auth, db } from "../config/firebase-config.js";


// =====================================
// ตัวแปรระบบ
// =====================================

let allUsers = [];
let allRooms = [];
let editingRoomId = null;
let allBookings = [];


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

        const adminName =
            document.getElementById("adminName");

        if (adminName) {
            adminName.textContent =
                userData.name || "Admin";
        }

        await Promise.all([
            loadUsers(),
            loadRooms(),
            loadBookings()
        ]);

    } catch (error) {

        console.error(
            "Admin Error:",
            error
        );

        alert(
            "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        );
    }
});


// =====================================
// จัดการผู้ใช้งาน
// =====================================

async function loadUsers() {

    try {

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );

        const adminTableBody =
            document.getElementById(
                "adminTableBody"
            );

        const userTableBody =
            document.getElementById(
                "userTableBody"
            );

        const adminCount =
            document.getElementById(
                "adminCount"
            );

        const userCount =
            document.getElementById(
                "userCount"
            );

        if (!adminTableBody || !userTableBody) {
            return;
        }

        adminTableBody.innerHTML = "";
        userTableBody.innerHTML = "";

        const admins = [];
        const users = [];

        usersSnapshot.forEach((userDoc) => {

            const user =
                userDoc.data();

            const item = {
                id: userDoc.id,
                ...user
            };

            if (user.role === "admin") {
                admins.push(item);
            } else {
                users.push(item);
            }
        });

        if (adminCount) {
            adminCount.textContent =
                `${admins.length} คน`;
        }

        if (userCount) {
            userCount.textContent =
                `${users.length} คน`;
        }


        function renderRows(
            list,
            tbody,
            isAdmin
        ) {

            if (list.length === 0) {

                tbody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            ${
                                isAdmin
                                    ? "ยังไม่มีผู้ดูแลระบบ"
                                    : "ยังไม่มีผู้ใช้งานทั่วไป"
                            }
                        </td>
                    </tr>
                `;

                return;
            }


            list.forEach((user) => {

                const isSelf =
                    auth.currentUser?.uid ===
                    user.id;

                const row =
                    document.createElement("tr");


                const nameCell =
                    document.createElement("td");

                nameCell.textContent =
                    user.name || "-";


                const emailCell =
                    document.createElement("td");

                emailCell.textContent =
                    user.email || "-";


                const roleCell =
                    document.createElement("td");

                roleCell.textContent =
                    isAdmin
                        ? "Admin"
                        : "User";


                const actionCell =
                    document.createElement("td");

                actionCell.className =
                    "user-actions";


                const roleButton =
                    document.createElement("button");

                roleButton.type =
                    "button";

                roleButton.className =
                    "btn btn-secondary change-role-btn";

                roleButton.textContent =
                    isAdmin
                        ? "เปลี่ยนเป็น User"
                        : "เปลี่ยนเป็น Admin";

                roleButton.dataset.uid =
                    user.id;

                roleButton.dataset.role =
                    isAdmin
                        ? "user"
                        : "admin";

                roleButton.disabled =
                    isSelf;


                const editButton =
                    document.createElement("button");

                editButton.type =
                    "button";

                editButton.className =
                    "btn btn-edit edit-user-btn";

                editButton.textContent =
                    "แก้ไข";

                editButton.dataset.uid =
                    user.id;

                editButton.dataset.name =
                    user.name || "";


                const deleteButton =
                    document.createElement("button");

                deleteButton.type =
                    "button";

                deleteButton.className =
                    "btn btn-delete delete-user-btn";

                deleteButton.textContent =
                    "ลบ";

                deleteButton.dataset.uid =
                    user.id;

                deleteButton.disabled =
                    isSelf;


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


        renderRows(
            admins,
            adminTableBody,
            true
        );

        renderRows(
            users,
            userTableBody,
            false
        );

    } catch (error) {

        console.error(
            "โหลดข้อมูลผู้ใช้ไม่สำเร็จ:",
            error
        );

        alert(
            "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
        );
    }
}


// =====================================
// ค้นหาผู้ใช้งานทั่วไป
// =====================================

const userSearch =
    document.getElementById(
        "userSearch"
    );

if (userSearch) {

    userSearch.addEventListener(
        "input",
        () => {

            const keyword =
                userSearch.value
                    .trim()
                    .toLowerCase();

            document
                .querySelectorAll(
                    "#userTableBody tr"
                )
                .forEach((row) => {

                    const text =
                        row.textContent
                            .toLowerCase();

                    row.style.display =
                        text.includes(keyword)
                            ? ""
                            : "none";
                });
        }
    );
}


// =====================================
// ปุ่มจัดการผู้ใช้
// =====================================

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".change-role-btn, .edit-user-btn, .delete-user-btn"
            );

        if (!button) {
            return;
        }

        const userId =
            button.dataset.uid;

        if (
            auth.currentUser?.uid ===
            userId
        ) {

            alert(
                "ไม่สามารถจัดการบัญชีตัวเองได้"
            );

            return;
        }

        try {

            button.disabled = true;


            // =====================================
            // เปลี่ยน Role
            // =====================================

            if (
                button.classList.contains(
                    "change-role-btn"
                )
            ) {

                const newRole =
                    button.dataset.role;

                const roleName =
                    newRole === "admin"
                        ? "Admin"
                        : "User";


                if (
                    !confirm(
                        `ต้องการเปลี่ยนเป็น ${roleName} หรือไม่?`
                    )
                ) {

                    button.disabled =
                        false;

                    return;
                }


                await updateDoc(
                    doc(
                        db,
                        "users",
                        userId
                    ),
                    {
                        role: newRole
                    }
                );


                alert(
                    "เปลี่ยนสิทธิ์สำเร็จ"
                );
            }


            // =====================================
            // ลบ User
            // =====================================

            if (
                button.classList.contains(
                    "delete-user-btn"
                )
            ) {

                if (
                    !confirm(
                        "ยืนยันลบข้อมูลโปรไฟล์ผู้ใช้นี้หรือไม่?"
                    )
                ) {

                    button.disabled =
                        false;

                    return;
                }


                await deleteDoc(
                    doc(
                        db,
                        "users",
                        userId
                    )
                );


                alert(
                    "ลบข้อมูลโปรไฟล์สำเร็จ"
                );
            }


            await loadUsers();

        } catch (error) {

            console.error(
                "จัดการผู้ใช้ไม่สำเร็จ:",
                error
            );

            alert(
                "ดำเนินการไม่สำเร็จ กรุณาตรวจสอบสิทธิ์ Firestore"
            );

            button.disabled =
                false;
        }
    }
);


// =====================================
// จัดการปุ่มในตารางผู้ใช้
// =====================================

const userTableBody =
    document.getElementById(
        "userTableBody"
    );

if (userTableBody) {

    userTableBody.addEventListener(
        "click",
        async (event) => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }

            const userId =
                button.dataset.uid;


            if (
                auth.currentUser &&
                userId ===
                    auth.currentUser.uid
            ) {

                alert(
                    "ไม่สามารถจัดการบัญชีตัวเองได้"
                );

                return;
            }


            // =====================================
            // แก้ไขชื่อผู้ใช้
            // =====================================

            if (
                button.classList.contains(
                    "edit-user-btn"
                )
            ) {

                const oldName =
                    button.dataset.name || "";


                const newName =
                    prompt(
                        "กรุณากรอกชื่อผู้ใช้ใหม่",
                        oldName
                    );


                if (newName === null) {
                    return;
                }


                const name =
                    newName.trim();


                if (!name) {

                    alert(
                        "กรุณากรอกชื่อผู้ใช้"
                    );

                    return;
                }


                if (name.length > 100) {

                    alert(
                        "ชื่อผู้ใช้ต้องไม่เกิน 100 ตัวอักษร"
                    );

                    return;
                }


                if (name === oldName) {
                    return;
                }


                try {

                    button.disabled =
                        true;


                    await updateDoc(
                        doc(
                            db,
                            "users",
                            userId
                        ),
                        {
                            name: name
                        }
                    );


                    alert(
                        "แก้ไขชื่อผู้ใช้สำเร็จ"
                    );


                    await loadUsers();

                } catch (error) {

                    console.error(
                        "แก้ไขชื่อไม่สำเร็จ:",
                        error
                    );

                    alert(
                        "ไม่สามารถแก้ไขชื่อได้"
                    );

                    button.disabled =
                        false;
                }
            }


            // =====================================
            // เปลี่ยน Role
            // =====================================

            if (
                button.classList.contains(
                    "change-role-btn"
                )
            ) {

                const newRole =
                    button.dataset.role;

                const roleName =
                    newRole === "admin"
                        ? "Admin"
                        : "User";


                const confirmed =
                    confirm(
                        `ต้องการเปลี่ยนบัญชีนี้เป็น ${roleName} หรือไม่?`
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    button.disabled =
                        true;


                    await updateDoc(
                        doc(
                            db,
                            "users",
                            userId
                        ),
                        {
                            role: newRole
                        }
                    );


                    await loadUsers();

                } catch (error) {

                    console.error(
                        "เปลี่ยน Role ไม่สำเร็จ:",
                        error
                    );

                    alert(
                        "ไม่สามารถเปลี่ยน Role ได้"
                    );

                    button.disabled =
                        false;
                }
            }


            // =====================================
            // ลบข้อมูลผู้ใช้
            // =====================================

            if (
                button.classList.contains(
                    "delete-user-btn"
                )
            ) {

                const confirmed =
                    confirm(
                        "ต้องการลบข้อมูลโปรไฟล์ผู้ใช้นี้หรือไม่?\n\n" +
                        "การลบนี้ไม่สามารถย้อนกลับได้ และจะไม่ลบบัญชี Firebase Authentication"
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    button.disabled =
                        true;


                    await deleteDoc(
                        doc(
                            db,
                            "users",
                            userId
                        )
                    );


                    alert(
                        "ลบข้อมูลโปรไฟล์สำเร็จ"
                    );


                    await loadUsers();

                } catch (error) {

                    console.error(
                        "ลบข้อมูลไม่สำเร็จ:",
                        error
                    );

                    alert(
                        "ไม่สามารถลบข้อมูลได้"
                    );

                    button.disabled =
                        false;
                }
            }
        }
    );
}


// =====================================
// จัดการห้อง
// =====================================


// =====================================
// โหลดรายการห้อง
// =====================================

async function loadRooms() {

    try {

        const response =
            await fetch(
                "../api/rooms/list.php"
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.message
            );

            return;
        }


        console.log(
            "Rooms:",
            result.rooms
        );


        allRooms =
            result.rooms || [];


        renderRooms(
            allRooms
        );

    } catch (error) {

        console.error(
            "Load rooms error:",
            error
        );

        alert(
            "ไม่สามารถโหลดข้อมูลห้องได้"
        );
    }
}


// =====================================
// เพิ่ม / แก้ไขห้อง
// =====================================

async function addRoom() {

    try {

        const roomName =
            document.getElementById(
                "roomName"
            ).value.trim();


        const roomType =
            document.getElementById(
                "roomType"
            ).value.trim();


        const capacity =
            Number(
                document.getElementById(
                    "capacity"
                ).value
            );


        const building =
            document.getElementById(
                "building"
            ).value.trim();


        const equipment =
            document.getElementById(
                "equipment"
            ).value.trim();


        const statusElement =
            document.getElementById(
                "status"
            );


        let status =
            statusElement
                ? statusElement.value
                : "available";


        // แปลงภาษาไทยเป็นค่าที่เก็บใน Firestore
        if (
            status ===
            "พร้อมใช้งาน"
        ) {

            status =
                "available";
        }


        if (
            status ===
            "ไม่พร้อมใช้งาน"
        ) {

            status =
                "unavailable";
        }


        // =====================================
        // ตรวจสอบข้อมูล
        // =====================================

        if (
            !roomName ||
            !roomType ||
            !capacity
        ) {

            alert(
                "กรุณากรอกข้อมูลห้องให้ครบ"
            );

            return;
        }


        const roomData = {

            roomName:
                roomName,

            roomType:
                roomType,

            capacity:
                capacity,

            building:
                building,

            equipment:
                equipment,

            status:
                status
        };


        // =====================================
        // แก้ไขห้อง
        // =====================================

        if (editingRoomId) {

            roomData.roomId =
                editingRoomId;


            const response =
                await fetch(
                    "../api/rooms/update.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                roomData
                            )
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "ไม่สามารถแก้ไขห้องได้"
                );
            }


            alert(
                "แก้ไขห้องสำเร็จ"
            );

        }


        // =====================================
        // เพิ่มห้อง
        // =====================================

        else {

            const response =
                await fetch(
                    "../api/rooms/create.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                roomData
                            )
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "ไม่สามารถเพิ่มห้องได้"
                );
            }


            alert(
                "เพิ่มห้องสำเร็จ"
            );
        }


        // ล้างฟอร์ม
        clearRoomForm();


        // โหลดรายการห้องใหม่
        await loadRooms();


    } catch (error) {

        console.error(
            "Add/Edit room error:",
            error
        );


        alert(
            "เกิดข้อผิดพลาด: " +
            error.message
        );
    }
}


// =====================================
// แสดงรายการห้อง
// =====================================

function renderRooms(rooms) {

    const roomTableBody =
        document.getElementById(
            "roomTableBody"
        );


    if (!roomTableBody) {

        console.error(
            "ไม่พบ roomTableBody"
        );

        return;
    }


    roomTableBody.innerHTML =
        "";


    if (
        !rooms ||
        rooms.length === 0
    ) {

        roomTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    ไม่พบข้อมูลห้อง
                </td>
            </tr>
        `;

        return;
    }


    // =====================================
    // เรียงเลขห้องน้อย → มาก
    // =====================================

    rooms.sort(
        (a, b) => {

            const numberA =
                parseInt(
                    String(
                        a.roomName || ""
                    )
                    .match(
                        /\d+/
                    )?.[0] || 0
                );


            const numberB =
                parseInt(
                    String(
                        b.roomName || ""
                    )
                    .match(
                        /\d+/
                    )?.[0] || 0
                );


            if (
                numberA !==
                numberB
            ) {

                return (
                    numberA -
                    numberB
                );
            }


            return String(
                a.roomName || ""
            ).localeCompare(
                String(
                    b.roomName || ""
                ),
                undefined,
                {
                    numeric: true
                }
            );
        }
    );


    // =====================================
    // แสดงแต่ละห้อง
    // =====================================

    rooms.forEach(
        room => {

            const row =
                document.createElement(
                    "tr"
                );


            // ชื่อห้อง
            const roomNameCell =
                document.createElement(
                    "td"
                );

            roomNameCell.textContent =
                room.roomName ||
                "-";


            // ประเภท
            const roomTypeCell =
                document.createElement(
                    "td"
                );

            roomTypeCell.textContent =
                room.roomType ||
                "-";


            // ความจุ
            const capacityCell =
                document.createElement(
                    "td"
                );

            capacityCell.textContent =
                room.capacity
                    ? `${room.capacity} คน`
                    : "-";


            // อาคาร
            const buildingCell =
                document.createElement(
                    "td"
                );

            buildingCell.textContent =
                room.building ||
                "-";


            // =====================================
            // สถานะ
            // =====================================

            const statusCell =
                document.createElement(
                    "td"
                );


            const status =
                document.createElement(
                    "span"
                );


            status.className =
                "room-status";


            if (
                room.status ===
                    "available" ||
                room.status ===
                    "พร้อมใช้งาน"
            ) {

                status.textContent =
                    "พร้อมใช้งาน";

            }

            else if (
                room.status ===
                    "unavailable" ||
                room.status ===
                    "ไม่พร้อมใช้งาน"
            ) {

                status.textContent =
                    "ไม่พร้อมใช้งาน";

            }

            else {

                status.textContent =
                    room.status ||
                    "-";
            }


            statusCell.appendChild(
                status
            );


            // =====================================
            // ปุ่มจัดการ
            // =====================================

            const actionCell =
                document.createElement(
                    "td"
                );


            const editButton =
                document.createElement(
                    "button"
                );

            editButton.type =
                "button";

            editButton.className =
                "btn btn-edit edit-btn";

            editButton.textContent =
                "แก้ไข";

            editButton.dataset.id =
                room.id;


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.className =
                "btn btn-delete delete-btn";

            deleteButton.textContent =
                "ลบ";

            deleteButton.dataset.id =
                room.id;


            actionCell.append(
                editButton,
                deleteButton
            );


            row.append(
                roomNameCell,
                roomTypeCell,
                capacityCell,
                buildingCell,
                statusCell,
                actionCell
            );


            roomTableBody.appendChild(
                row
            );
        }
    );
}


// =====================================
// แก้ไขห้อง
// =====================================

function editRoom(roomId) {

    const room =
        allRooms.find(
            room =>
                room.id ===
                roomId
        );


    if (!room) {

        alert(
            "ไม่พบข้อมูลห้อง"
        );

        return;
    }


    // ใส่ข้อมูลเดิมลงฟอร์ม
    document.getElementById(
        "roomName"
    ).value =
        room.roomName ||
        "";


    document.getElementById(
        "roomType"
    ).value =
        room.roomType ||
        "";


    document.getElementById(
        "capacity"
    ).value =
        room.capacity ||
        "";


    document.getElementById(
        "building"
    ).value =
        room.building ||
        "";


    document.getElementById(
        "equipment"
    ).value =
        room.equipment ||
        "";


    const statusElement =
        document.getElementById(
            "status"
        );


    if (statusElement) {

        if (
            room.status ===
            "พร้อมใช้งาน"
        ) {

            statusElement.value =
                "available";

        }

        else if (
            room.status ===
            "ไม่พร้อมใช้งาน"
        ) {

            statusElement.value =
                "unavailable";

        }

        else {

            statusElement.value =
                room.status ||
                "available";
        }
    }


    // จำ ID ห้อง
    editingRoomId =
        roomId;


    // เปลี่ยนข้อความปุ่ม
    const saveButton =
        document.getElementById(
            "saveRoomButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "บันทึกการแก้ไข";
    }


    // เลื่อนไปยังฟอร์ม
    document.getElementById(
        "roomName"
    )?.scrollIntoView({
        behavior:
            "smooth",

        block:
            "center"
    });
}


// =====================================
// ลบห้อง
// =====================================

async function deleteRoom(roomId) {

    if (
        !confirm(
            "ต้องการลบห้องนี้ใช่หรือไม่?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                "../api/rooms/delete.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            roomId:
                                roomId
                        })
                }
            );


        const result =
            await response.json();


        if (
            result.success
        ) {

            alert(
                "ลบห้องสำเร็จ"
            );


            await loadRooms();

        }

        else {

            alert(
                result.message
            );
        }


    } catch (error) {

        console.error(
            "Delete room error:",
            error
        );


        alert(
            "ไม่สามารถลบห้องได้"
        );
    }
}


// =====================================
// ปุ่มแก้ไข / ลบห้อง
// =====================================

const roomTableBody =
    document.getElementById(
        "roomTableBody"
    );


if (roomTableBody) {

    roomTableBody.addEventListener(
        "click",
        function (event) {

            const editButton =
                event.target.closest(
                    ".edit-btn"
                );


            const deleteButton =
                event.target.closest(
                    ".delete-btn"
                );


            if (editButton) {

                editRoom(
                    editButton.dataset.id
                );

                return;
            }


            if (deleteButton) {

                deleteRoom(
                    deleteButton.dataset.id
                );
            }
        }
    );
}


// =====================================
// ล้างฟอร์ม
// =====================================

function clearRoomForm() {

    document.getElementById(
        "roomName"
    ).value = "";


    document.getElementById(
        "roomType"
    ).value = "";


    document.getElementById(
        "capacity"
    ).value = "";


    document.getElementById(
        "building"
    ).value = "";


    document.getElementById(
        "equipment"
    ).value = "";


    const statusElement =
        document.getElementById(
            "status"
        );


    if (statusElement) {

        statusElement.value =
            "available";
    }


    editingRoomId =
        null;


    const saveButton =
        document.getElementById(
            "saveRoomButton"
        );


    if (saveButton) {

        saveButton.textContent =
            "+ เพิ่มห้อง";
    }
}


// =====================================
// ปุ่มเพิ่ม / บันทึก
// =====================================

const saveRoomButton =
    document.getElementById(
        "saveRoomButton"
    );


if (saveRoomButton) {

    saveRoomButton.addEventListener(
        "click",
        addRoom
    );
}


// =====================================
// ปุ่มล้างข้อมูล
// =====================================

const clearRoomButton =
    document.getElementById(
        "clearRoomButton"
    );


if (clearRoomButton) {

    clearRoomButton.addEventListener(
        "click",
        clearRoomForm
    );
}


// =====================================
// ออกจากระบบ
// =====================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            if (
                !confirm(
                    "คุณต้องการออกจากระบบหรือไม่?"
                )
            ) {

                return;
            }


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "../public/Login.html";

            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "ไม่สามารถออกจากระบบได้"
                );
            }
        }
    );
}


// =====================================
// จัดการคำขอจองห้อง
// =====================================

async function loadBookings() {

    const tbody =
        document.getElementById(
            "bookingRequestsBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td colspan="7">
                กำลังโหลดคำขอจอง...
            </td>
        </tr>
    `;


    try {

        const [
            bookingSnapshot,
            userSnapshot
        ] =
            await Promise.all([
                getDocs(
                    collection(
                        db,
                        "bookings"
                    )
                ),

                getDocs(
                    collection(
                        db,
                        "users"
                    )
                )
            ]);


        // =====================================
        // UID -> ชื่อผู้ใช้
        // =====================================

        const userNames =
            new Map();


        userSnapshot.forEach(
            userDoc => {

                const user =
                    userDoc.data();


                userNames.set(
                    userDoc.id,
                    user.name ||
                    user.email ||
                    "-"
                );
            }
        );


        // =====================================
        // โหลด Booking
        // =====================================

        allBookings =
            bookingSnapshot.docs.map(
                item => {

                    const data =
                        item.data();


                    return {

                        id:
                            item.id,

                        ...data,

                        userName:
                            userNames.get(
                                data.userId
                            ) ||
                            "ไม่พบผู้ใช้"
                    };
                }
            );


        // =====================================
        // เรียงวันที่ / เวลา
        // =====================================

        allBookings.sort(
            (a, b) =>

                `${b.bookingDate || ""} ${b.startTime || ""}`
                    .localeCompare(
                        `${a.bookingDate || ""} ${a.startTime || ""}`
                    )
        );


        renderBookingRequests();


    } catch (error) {

        console.error(
            "โหลดคำขอจองไม่สำเร็จ:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    ไม่สามารถโหลดคำขอจองได้
                </td>
            </tr>
        `;
    }
}


// =====================================
// แสดงคำขอจอง
// =====================================

function renderBookingRequests() {

    const tbody =
        document.getElementById(
            "bookingRequestsBody"
        );


    const filter =
        document.getElementById(
            "bookingStatusFilter"
        );


    if (!tbody) {
        return;
    }


    const statusFilter =
        filter?.value ||
        "all";


    const bookings =
        allBookings.filter(
            booking =>

                statusFilter ===
                    "all" ||

                booking.status ===
                    statusFilter
        );


    tbody.innerHTML =
        "";


    if (
        bookings.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    ไม่พบคำขอจองในสถานะนี้
                </td>
            </tr>
        `;

        return;
    }


    const statusLabels = {

        pending:
            "รออนุมัติ",

        approved:
            "อนุมัติแล้ว",

        rejected:
            "ปฏิเสธแล้ว"
    };


    bookings.forEach(
        booking => {

            const row =
                document.createElement(
                    "tr"
                );


            const values = [

                booking.roomName ||
                    "-",

                booking.userName,

                booking.bookingDate ||
                    "-",

                `${booking.startTime || "-"} - ${booking.endTime || "-"}`,

                `${booking.people ?? "-"} คน`
            ];


            values.forEach(
                value => {

                    const cell =
                        document.createElement(
                            "td"
                        );


                    cell.textContent =
                        value;


                    row.appendChild(
                        cell
                    );
                }
            );


            // =====================================
            // สถานะ
            // =====================================

            const statusCell =
                document.createElement(
                    "td"
                );


            const status =
                document.createElement(
                    "span"
                );


            const currentStatus =
                statusLabels[
                    booking.status
                ]
                    ? booking.status
                    : "pending";


            status.className =
                `booking-status ${currentStatus}`;


            status.textContent =
                statusLabels[
                    booking.status
                ] ||
                booking.status ||
                "ไม่ระบุ";


            statusCell.appendChild(
                status
            );


            row.appendChild(
                statusCell
            );


            // =====================================
            // ปุ่ม
            // =====================================

            const actionCell =
                document.createElement(
                    "td"
                );


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "booking-action";


            if (
                booking.status ===
                "pending"
            ) {

                const approve =
                    document.createElement(
                        "button"
                    );


                approve.type =
                    "button";


                approve.className =
                    "booking-approve";


                approve.textContent =
                    "อนุมัติ";


                approve.dataset.id =
                    booking.id;


                approve.dataset.status =
                    "approved";


                const reject =
                    document.createElement(
                        "button"
                    );


                reject.type =
                    "button";


                reject.className =
                    "booking-reject";


                reject.textContent =
                    "ปฏิเสธ";


                reject.dataset.id =
                    booking.id;


                reject.dataset.status =
                    "rejected";


                actions.append(
                    approve,
                    reject
                );

            } else {

                actions.textContent =
                    "ดำเนินการแล้ว";
            }


            actionCell.appendChild(
                actions
            );


            row.appendChild(
                actionCell
            );


            tbody.appendChild(
                row
            );
        }
    );
}


// =====================================
// อนุมัติ / ปฏิเสธคำขอจอง
// =====================================

document
    .getElementById(
        "bookingRequestsBody"
    )
    ?.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    ".booking-approve, .booking-reject"
                );


            if (
                !button ||
                button.disabled
            ) {

                return;
            }


            const bookingId =
                button.dataset.id;


            const newStatus =
                button.dataset.status;


            const actionName =
                newStatus ===
                    "approved"
                    ? "อนุมัติ"
                    : "ปฏิเสธ";


            if (
                !confirm(
                    `ยืนยันการ${actionName}คำขอจองนี้หรือไม่?`
                )
            ) {

                return;
            }


            try {

                button.disabled =
                    true;


                await updateDoc(
                    doc(
                        db,
                        "bookings",
                        bookingId
                    ),
                    {
                        status:
                            newStatus
                    }
                );


                alert(
                    `${actionName}คำขอจองสำเร็จ`
                );


                await loadBookings();


            } catch (error) {

                console.error(
                    "เปลี่ยนสถานะคำขอไม่สำเร็จ:",
                    error
                );


                alert(
                    "ไม่สามารถเปลี่ยนสถานะได้ กรุณาตรวจสอบ Firestore Rules"
                );


                button.disabled =
                    false;
            }
        }
    );


// =====================================
// กรองสถานะ Booking
// =====================================

document
    .getElementById(
        "bookingStatusFilter"
    )
    ?.addEventListener(
        "change",
        renderBookingRequests
    );


// =====================================
// รีเฟรช Booking
// =====================================

document
    .getElementById(
        "refreshBookings"
    )
    ?.addEventListener(
        "click",
        loadBookings
    );