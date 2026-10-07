<?php

header('Content-Type: application/json; charset=utf-8');

try {

    // ==========================================
    // โฟลเดอร์เก็บรูป
    // ==========================================

    $uploadDir = __DIR__ . '/../../src/images/rooms/';


    // ==========================================
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    // ==========================================

    if (!is_dir($uploadDir)) {

        if (!mkdir($uploadDir, 0777, true)) {

            throw new Exception(
                'ไม่สามารถสร้างโฟลเดอร์ src/images/rooms ได้'
            );
        }
    }


    // ==========================================
    // ตรวจสอบว่ามีไฟล์หรือไม่
    // ==========================================

    if (!isset($_FILES['image'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบไฟล์รูป'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }


    $file = $_FILES['image'];


    // ==========================================
    // ตรวจสอบ Error
    // ==========================================

    if ($file['error'] !== UPLOAD_ERR_OK) {

        throw new Exception(
            'Upload error code: ' . $file['error']
        );
    }


    // ==========================================
    // ตรวจสอบขนาด
    // ==========================================

    if ($file['size'] > 5 * 1024 * 1024) {

        throw new Exception(
            'ไฟล์ต้องมีขนาดไม่เกิน 5MB'
        );
    }


    // ==========================================
    // ตรวจสอบนามสกุล
    // ==========================================

    $extension =
        strtolower(
            pathinfo(
                $file['name'],
                PATHINFO_EXTENSION
            )
        );


    $allowedExtensions = [
        'jpg',
        'jpeg',
        'png',
        'webp'
    ];


    if (!in_array(
        $extension,
        $allowedExtensions,
        true
    )) {

        throw new Exception(
            'รองรับเฉพาะ JPG, JPEG, PNG และ WEBP'
        );
    }


    // ==========================================
    // สร้างชื่อไฟล์ใหม่
    // ==========================================

    $fileName =
        'room_' .
        uniqid('', true) .
        '.' .
        $extension;


    $destination =
        $uploadDir . $fileName;


    // ==========================================
    // ย้ายไฟล์
    // ==========================================

    if (!move_uploaded_file(
        $file['tmp_name'],
        $destination
    )) {

        throw new Exception(
            'ไม่สามารถบันทึกรูปไปที่ src/images/rooms ได้'
        );
    }


    // ==========================================
    // สำเร็จ
    // ==========================================

    echo json_encode([
        'success' => true,
        'message' => 'อัปโหลดรูปสำเร็จ',
        'fileName' => $fileName
    ], JSON_UNESCAPED_UNICODE);

    exit;


} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}