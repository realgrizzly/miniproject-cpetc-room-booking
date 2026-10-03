<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Google\Cloud\Firestore\FirestoreClient;

// ตำแหน่ง Service Account
$keyFile = __DIR__ . '/serviceAccountKey.json';

// ตรวจสอบว่าไฟล์มีอยู่จริง
if (!file_exists($keyFile)) {
    die('ไม่พบ serviceAccountKey.json');
}

// กำหนด Google Application Credentials
putenv('GOOGLE_APPLICATION_CREDENTIALS=' . $keyFile);

// Project ID
putenv('GOOGLE_CLOUD_PROJECT=project-room-booking');

// สร้าง Firestore
$firestore = new FirestoreClient([
    'projectId' => 'project-room-booking'
]);