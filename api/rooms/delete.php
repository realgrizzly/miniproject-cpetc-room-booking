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

    $roomRef->delete();

    echo json_encode([
        'success' => true,
        'message' => 'ลบห้องสำเร็จ'
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}