<?php
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'Reverse2048_DB';
$user = 'ubuntu';
$pass = '000012345';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $stmt = $pdo->query("SELECT nickname, turn, score, play_time, created_at FROM rankings ORDER BY turn ASC LIMIT 100");
    $rankings = $stmt->fetchAll();

    // 등수 추가
    foreach ($rankings as $index => &$ranking) {
        $ranking['rank'] = $index + 1;
    }

    echo json_encode(['success' => true, 'data' => $rankings]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>