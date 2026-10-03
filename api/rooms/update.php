<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/firebase.php';

$data = json_decode(file_get_contents('php://input'), true);

$roomId = trim($data['roomId'] ?? '');

if ($roomId === '') {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'ไม่พบ Room ID'
    ]);

    exit;
}

$updateData = [];

if (isset($data['roomName'])) {
    $updateData['roomName'] = trim($data['roomName']);
}

if (isset($data['roomType'])) {
    $updateData['roomType'] = trim($data['roomType']);
}

if (isset($data['capacity'])) {
    $updateData['capacity'] = intval($data['capacity']);
}

if (isset($data['building'])) {
    $updateData['building'] = trim($data['building']);
}

if (isset($data['equipment'])) {
    $updateData['equipment'] = trim($data['equipment']);
}

if (isset($data['status'])) {
    $updateData['status'] = trim($data['status']);
}

if (empty($updateData)) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'ไม่มีข้อมูลที่ต้องแก้ไข'
    ]);

    exit;
}

try {

    $roomRef = $firestore
        ->collection('rooms')
        ->document($roomId);

    $room = $roomRef->snapshot();

    if (!$room->exists()) {

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบห้องนี้'
        ]);

        exit;
    }

    $updates = [];

    foreach ($updateData as $field => $value) {
        $updates[] = [
            'path' => $field,
            'value' => $value
        ];
    }

    $roomRef->update($updates);

    echo json_encode([
        'success' => true,
        'message' => 'แก้ไขห้องสำเร็จ'
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}