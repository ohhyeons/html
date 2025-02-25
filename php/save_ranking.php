
<?php
$host = 'localhost'; // MySQL 서버가 같은 EC2 인스턴스에 있는 경우
$db   = 'Reverse2048_DB';  // 생성한 데이터베이스 이름
$user = 'ubuntu';          // 생성한 MySQL 사용자 이름
$pass = '000012345';     // ubuntu 사용자의 비밀번호 (안전한 비밀번호로!)
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // POST 요청 데이터 받기
    $data = json_decode(file_get_contents('php://input'), true); // JSON 데이터 파싱


    // 데이터 유효성 검사
    if (empty($data['nickname']) || empty($data['turn']) || !isset($data['score'])) {
        //isset은 0도 false로 인식하기 때문에 !isset으로 하는게 맞다.
        throw new Exception('필수 데이터가 누락되었습니다.');
    }


    // 닉네임 중복 검사
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM rankings WHERE nickname = ?");
    $stmt->execute([$data['nickname']]);
    if ($stmt->fetchColumn() > 0) {
        throw new Exception('이미 사용 중인 닉네임입니다.');
    }


    // 랭킹 데이터 삽입
    $stmt = $pdo->prepare("INSERT INTO rankings (nickname, turn, score) VALUES (?, ?, ?)");
    $stmt->execute([$data['nickname'], $data['turn'], $data['score']]);

    // 성공 응답
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    // 오류 처리
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}