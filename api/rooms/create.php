<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/firebase.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON'
    ]);

    exit;
}

$roomName = trim($data['roomName'] ?? '');
$roomType = trim($data['roomType'] ?? '');
$capacity = intval($data['capacity'] ?? 0);
$building = trim($data['building'] ?? '');
$equipment = trim($data['equipment'] ?? '');
$status = trim($data['status'] ?? 'available');

if ($roomName === '' || $roomType === '' || $capacity <= 0) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'กรุณากรอกข้อมูลห้องให้ครบ'
    ]);

    exit;
}

try {

    $roomRef = $firestore->collection('rooms')->add([
        'roomName' => $roomName,
        'roomType' => $roomType,
        'capacity' => $capacity,
        'building' => $building,
        'equipment' => $equipment,
        'status' => $status
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'เพิ่มห้องสำเร็จ',
        'roomId' => $roomRef->id()
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}