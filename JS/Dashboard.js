// ==========================================
// FIREBASE
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    auth,
    db
} from "../config/firebase-config.js";


// ==========================================
// เริ่มต้นระบบ
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    setupLogout();

    loadUserData();

});


// ==========================================
// LOAD USER DATA
// ==========================================

function loadUserData() {

    onAuthStateChanged(auth, async (user) => {

        // ------------------------------------------
        // ยังไม่ได้ Login
        // ------------------------------------------

        if (!user) {

            console.log("ยังไม่ได้เข้าสู่ระบบ");

            window.location.href =
                "../public/Login.html";

            return;
        }


        try {

            // ------------------------------------------
            // เก็บ User ปัจจุบัน
            // ------------------------------------------

            console.log(
                "Current User UID:",
                user.uid
            );


            // ------------------------------------------
            // ดึงข้อมูล User จาก Firestore
            // ------------------------------------------

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );

            const userDoc =
                await getDoc(userRef);


            console.log(
                "พบเอกสาร User:",
                userDoc.exists()
            );


            // ------------------------------------------
            // ค่าเริ่มต้น
            // ------------------------------------------

            let userName =
                user.displayName ||
                "ผู้ใช้งาน";

            let userEmail =
                user.email ||
                "-";

            let userRole =
                "user";


            // ------------------------------------------
            // ถ้ามีข้อมูลใน Firestore
            // ------------------------------------------

            if (userDoc.exists()) {

                const userData =
                    userDoc.data();


                console.log(
                    "ข้อมูล Firestore:",
                    userData
                );


                userName =
                    userData.name ||
                    user.displayName ||
                    "ผู้ใช้งาน";


                userEmail =
                    userData.email ||
                    user.email ||
                    "-";


                userRole =
                    userData.role ||
                    "user";

            }


            // ==========================================
            // แสดงชื่อ Navbar
            // ==========================================

            const userNameElement =
                document.getElementById(
                    "userName"
                );

            if (userNameElement) {

                userNameElement.textContent =
                    userName;

            }


            // ==========================================
            // แสดงชื่อ Welcome
            // ==========================================

            const welcomeName =
                document.getElementById(
                    "welcomeName"
                );

            if (welcomeName) {

                welcomeName.textContent =
                    userName;

            }


            // ==========================================
            // Profile Name
            // ==========================================

            const profileName =
                document.getElementById(
                    "profileName"
                );

            if (profileName) {

                profileName.textContent =
                    userName;

            }


            // ==========================================
            // Profile Email
            // ==========================================

            const profileEmail =
                document.getElementById(
                    "profileEmail"
                );

            if (profileEmail) {

                profileEmail.textContent =
                    userEmail;

            }


            // ==========================================
            // Profile Role
            // ==========================================

            const profileRole =
                document.getElementById(
                    "profileRole"
                );

            if (profileRole) {

                profileRole.textContent =
                    userRole === "admin"
                        ? "Admin"
                        : "User";

            }


            // ==========================================
            // Admin Menu
            // ==========================================

            const adminMenu =
                document.getElementById(
                    "adminMenu"
                );

            if (adminMenu) {

                adminMenu.style.display =
                    userRole === "admin"
                        ? "flex"
                        : "none";

            }


            // ==========================================
            // โหลดข้อมูลการจอง
            // ==========================================

            await loadBookingStats(user);


            console.log(
                "โหลด Dashboard สำเร็จ"
            );


        } catch (error) {

            console.error(
                "เกิดข้อผิดพลาดในการโหลด User:",
                error
            );

        }

    });

}


// ==========================================
// BOOKING STATISTICS
// ==========================================

async function loadBookingStats(user) {

    try {

        console.log(
            "กำลังโหลด Booking ของ:",
            user.uid
        );


        // ==========================================
        // ดึง Booking ของ User คนนี้
        // ==========================================

        const bookingQuery =
            query(
                collection(
                    db,
                    "bookings"
                ),
                where(
                    "userId",
                    "==",
                    user.uid
                )
            );


        const snapshot =
            await getDocs(
                bookingQuery
            );


        console.log(
            "จำนวน Booking:",
            snapshot.size
        );


        // ==========================================
        // แปลงข้อมูล
        // ==========================================

        const bookings =
            snapshot.docs.map(
                (item) => ({

                    id: item.id,

                    ...item.data()

                })
            );


        console.log(
            "Bookings:",
            bookings
        );


        // ==========================================
        // วันที่ปัจจุบัน
        // ==========================================

        const now =
            new Date();


        const today =
            `${now.getFullYear()}-` +
            `${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-` +
            `${String(
                now.getDate()
            ).padStart(2, "0")}`;


        console.log(
            "วันนี้:",
            today
        );


        // ==========================================
        // การจองทั้งหมด
        // ==========================================

        const total =
            bookings.length;


        // ==========================================
        // ยกเลิก
        // ==========================================

        const cancelled =
            bookings.filter(
                (booking) =>

                    booking.status ===
                    "cancelled"

                    ||

                    booking.status ===
                    "rejected"

                    ||

                    booking.status ===
                    "expired"
            ).length;


        // ==========================================
        // การจองที่กำลังจะมาถึง
        // ==========================================

        const upcoming =
            bookings.filter(
                (booking) => {

                    const bookingDate =
                        String(
                            booking.bookingDate ||
                            ""
                        );


                    return (

                        bookingDate >= today

                        &&

                        booking.status !==
                            "cancelled"

                        &&

                        booking.status !==
                            "rejected"

                        &&

                        booking.status !==
                            "expired"

                    );

                }
            ).length;


        console.log(
            "Total:",
            total,
            "Upcoming:",
            upcoming,
            "Cancelled:",
            cancelled
        );


        // ==========================================
        // แสดงตัวเลขบน Dashboard
        // ==========================================

        const totalElement =
            document.getElementById(
                "totalBookings"
            );


        const upcomingElement =
            document.getElementById(
                "upcomingBookings"
            );


        const cancelledElement =
            document.getElementById(
                "cancelledBookings"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (upcomingElement) {

            upcomingElement.textContent =
                upcoming;

        }


        if (cancelledElement) {

            cancelledElement.textContent =
                cancelled;

        }


        // ==========================================
        // เรียง Booking ล่าสุด
        // ==========================================

        const recentBookings =
            [...bookings]
                .sort((a, b) => {

                    const dateA =
                        `${a.bookingDate || ""} ${a.startTime || ""}`;

                    const dateB =
                        `${b.bookingDate || ""} ${b.startTime || ""}`;


                    return dateB.localeCompare(
                        dateA
                    );

                })
                .slice(0, 5);


        // ==========================================
        // แสดงรายการล่าสุด
        // ==========================================

        renderRecentBookings(
            recentBookings
        );


    } catch (error) {

        console.error(
            "โหลดข้อมูล Booking ไม่สำเร็จ:",
            error
        );

    }

}


// ==========================================
// แสดงรายการจองล่าสุด
// ==========================================

function renderRecentBookings(bookings) {

    const historySection =
        document.getElementById(
            "history"
        );


    if (!historySection) {

        console.warn(
            "ไม่พบ #history"
        );

        return;
    }


    const bookingCard =
        historySection.querySelector(
            ".booking-card"
        );


    if (!bookingCard) {

        console.warn(
            "ไม่พบ .booking-card"
        );

        return;
    }


    // ==========================================
    // ไม่มี Booking
    // ==========================================

    if (bookings.length === 0) {

        bookingCard.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-calendar-xmark"></i>

                </div>


                <h3>
                    ยังไม่มีประวัติการจอง
                </h3>


                <p>
                    เมื่อคุณทำการจองห้อง
                    รายการจองจะแสดงที่นี่
                </p>


                <a
                    href="Booking.html"
                    class="primary-button"
                >

                    <i class="fa-solid fa-calendar-plus"></i>

                    จองห้องแรกของคุณ

                </a>

            </div>

        `;

        return;
    }


    // ==========================================
    // มี Booking
    // ==========================================

    bookingCard.innerHTML = `

        <div class="dashboard-booking-list">

            ${bookings.map(
                (booking) => {

                    const status =
                        getBookingStatus(
                            booking.status
                        );


                    return `

                        <div
                            class="dashboard-booking-item"
                        >

                            <!-- ห้อง -->

                            <div
                                class="dashboard-booking-room"
                            >

                                <div
                                    class="booking-room-icon"
                                >

                                    <i
                                        class="fa-solid fa-door-open"
                                    ></i>

                                </div>


                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            booking.roomName ||
                                            "-"
                                        )}
                                    </strong>


                                    <span>
                                        ${escapeHTML(
                                            booking.bookingDate ||
                                            "-"
                                        )}
                                    </span>

                                </div>

                            </div>


                            <!-- เวลา -->

                            <div
                                class="dashboard-booking-info"
                            >

                                <span>

                                    <i
                                        class="fa-regular fa-clock"
                                    ></i>

                                    ${escapeHTML(
                                        booking.startTime ||
                                        "-"
                                    )}

                                    -

                                    ${escapeHTML(
                                        booking.endTime ||
                                        "-"
                                    )}

                                </span>


                                <span>

                                    <i
                                        class="fa-solid fa-users"
                                    ></i>

                                    ${Number(
                                        booking.people ||
                                        0
                                    )}

                                    คน

                                </span>

                            </div>


                            <!-- Status -->

                            <span
                                class="
                                    dashboard-booking-status
                                    ${status.className}
                                "
                            >

                                ${status.text}

                            </span>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;

}


// ==========================================
// BOOKING STATUS
// ==========================================

function getBookingStatus(status) {

    switch (status) {

        case "approved":

            return {

                text: "อนุมัติแล้ว",

                className: "approved"

            };


        case "cancelled":

            return {

                text: "ยกเลิกแล้ว",

                className: "cancelled"

            };


        case "rejected":

            return {

                text: "ปฏิเสธ",

                className: "rejected"

            };


        case "expired":

            return {

                text: "หมดอายุ",

                className: "cancelled"

            };


        default:

            return {

                text: "รออนุมัติ",

                className: "pending"

            };

    }

}


// ==========================================
// ป้องกัน HTML แปลก ๆ จาก Firestore
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutButton) {

        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmLogout =
                confirm(
                    "คุณต้องการออกจากระบบหรือไม่?"
                );


            if (!confirmLogout) {

                return;
            }


            try {

                await signOut(auth);


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

// ==========================================
// HERO BANNER SLIDER - FADE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const slides =
            document.querySelectorAll(
                ".hero-slide"
            );

        const dots =
            document.querySelectorAll(
                ".slider-dot"
            );

        const prevButton =
            document.getElementById(
                "sliderPrev"
            );

        const nextButton =
            document.getElementById(
                "sliderNext"
            );


        if (!slides.length) {
            return;
        }


        let currentSlide = 0;

        let slideTimer = null;


        // ======================================
        // แสดง Slide
        // ======================================

        function showSlide(index) {

            if (index < 0) {

                index =
                    slides.length - 1;

            }

            if (
                index >= slides.length
            ) {

                index = 0;

            }


            slides.forEach(
                (slide, i) => {

                    slide.classList.toggle(
                        "active",
                        i === index
                    );

                }
            );


            dots.forEach(
                (dot, i) => {

                    dot.classList.toggle(
                        "active",
                        i === index
                    );

                }
            );


            currentSlide = index;

        }


        // ======================================
        // NEXT
        // ======================================

        function nextSlide() {

            showSlide(
                currentSlide + 1
            );

        }


        // ======================================
        // PREVIOUS
        // ======================================

        function previousSlide() {

            showSlide(
                currentSlide - 1
            );

        }


        // ======================================
        // AUTO PLAY
        // 5 วินาที / รูป
        // ======================================

        function startSlider() {

            clearInterval(
                slideTimer
            );

            slideTimer =
                setInterval(
                    nextSlide,
                    2000
                );

        }


        // ======================================
        // NEXT BUTTON
        // ======================================

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function () {

                    nextSlide();

                    startSlider();

                }
            );

        }


        // ======================================
        // PREVIOUS BUTTON
        // ======================================

        if (prevButton) {

            prevButton.addEventListener(
                "click",
                function () {

                    previousSlide();

                    startSlider();

                }
            );

        }


        // ======================================
        // DOTS
        // ======================================

        dots.forEach(
            (dot, index) => {

                dot.addEventListener(
                    "click",
                    function () {

                        showSlide(index);

                        startSlider();

                    }
                );

            }
        );


        // ======================================
        // START
        // ======================================

        showSlide(0);

        startSlider();

    }
);