<?php

header('Content-Type: application/json; charset=utf-8');

$uploadDir = __DIR__ . '/../../src/images/rooms/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!isset($_FILES['image'])) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'ไม่พบไฟล์รูป'
    ]);

    exit;
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการอัปโหลด'
    ]);

    exit;
}


// ตรวจสอบขนาดไฟล์
$maxSize = 5 * 1024 * 1024;

if ($file['size'] > $maxSize) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'ไฟล์ต้องมีขนาดไม่เกิน 5MB'
    ]);

    exit;
}


// ตรวจสอบประเภทไฟล์
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

$fileInfo =
    finfo_open(FILEINFO_MIME_TYPE);

$mimeType =
    finfo_file(
        $fileInfo,
        $file['tmp_name']
    );

finfo_close($fileInfo);


if (!isset($allowedTypes[$mimeType])) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'รองรับเฉพาะ JPG, PNG และ WEBP'
    ]);

    exit;
}


// สร้างชื่อไฟล์ใหม่
$fileName =
    uniqid('room_', true)
    . '.'
    . $allowedTypes[$mimeType];


$destination =
    $uploadDir . $fileName;


// ย้ายไฟล์
if (
    !move_uploaded_file(
        $file['tmp_name'],
        $destination
    )
) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'ไม่สามารถบันทึกไฟล์ได้'
    ]);

    exit;
}


// ส่งชื่อไฟล์กลับ
echo json_encode([
    'success' => true,
    'fileName' => $fileName
]);