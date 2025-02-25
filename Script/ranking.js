// 랭킹 데이터 가져와서 테이블 업데이트
// HTML을 업데이트하고 데이터 저장 및 조회를 처리하는 자바스크립트
// 페이지로드드
// ranking.html -> ranking.js => loadRaing() -> get_rankings.php -> saveRanking() -> save_rank.php
// 데이터 저장
// 게임 종료 시 saveRanking() 호출 → save_rank.php로 데이터 전송
async function loadRankings() {
    try {
        const response = await fetch('./php/get_rankings.php');
        const result = await response.json();

        if (result.success) {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = ''; // 기존 데이터 초기화

            result.data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.rank}</td>
                    <td>${row.nickname}</td>
                    <td>${row.turn}</td>
                    <td>${row.play_time}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            console.error('랭킹 로드 실패:', result.message);
        }
    } catch (error) {
        console.error('서버 오류:', error);
    }
}

// 데이터 저장 함수
async function saveRanking(nickname, turn, score, playTime) {
    const data = {
        nickname: nickname,
        turn: turn,
        score: score,
        play_time: playTime
    };

    try {
        const response = await fetch('./php/save_rank.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('랭킹이 저장되었습니다!');
            // ./php/get_rankings.php에서 데이터를 가져와서 테이블(<tbody>)에 동적으로 채움움
            loadRankings(); // 저장 후 랭킹 새로고침
        } else {
            alert('오류: ' + result.message);
        }
    } catch (error) {
        alert('서버 오류: ' + error.message);
    }
}

// 페이지 로드 시 랭킹 표시
window.onload = function() {
    loadRankings();
};

// 테스트용 호출 예시 (게임에서 호출할 때 사용)
saveRanking('홍길동', 50, 1500, '00:12:34');