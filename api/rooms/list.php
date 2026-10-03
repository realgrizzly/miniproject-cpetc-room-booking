<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config/firebase.php';

try {

    $rooms = $firestore->collection('rooms')->documents();

    $result = [];

    foreach ($rooms as $room) {

        if (!$room->exists()) {
            continue;
        }

        $data = $room->data();

        $result[] = [
            'id' => $room->id(),
            'roomName' => $data['roomName'] ?? '',
            'roomType' => $data['roomType'] ?? '',
            'capacity' => $data['capacity'] ?? 0,
            'building' => $data['building'] ?? '',
            'equipment' => $data['equipment'] ?? '',
            'status' => $data['status'] ?? 'available'
        ];
    }

    echo json_encode([
        'success' => true,
        'rooms' => $result
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}