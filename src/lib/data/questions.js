// src/data/questions.js
export const questions = [
    {
        id: 1,
        type: 'checkbox',           // 복수 선택 가능
        stepLabel: '1 / 11',
        question: '해당되는 습관을 선택해주세요\n(중복선택 가능)',  // 위 UI처럼 설명 문구 추가
        multiple: true,
        options: [
          '심한 코골이',
          '흡연',
          '손톱 깨물기 (오른쪽)',
          '손톱 깨물기 (왼쪽)',
          '껌 씹기 (오른쪽)',
          '껌 씹기 (왼쪽)',
          '턱 괴기 (좌 / 우)',
          '옆드려 누워 휴대폰 사용',
          '해당사항 없음'
        ]
    },
    {
      id: 2,
      type: 'multipleChoice',
      stepLabel: '2 / 11',
      question: '일상생활 중 통증 유무에 대한 질문입니다.',
      multiple: false,
      options: ['평소 통증 있음', '평소 통증 없음']
    },
    {
      id: 3,
      type: 'info',
      stepLabel: '3 / 11',
      content: `
        예시) 🔴 부분을 누르는 동안 통증이 느껴지는 경우를 연관통이라고 합니다.
  
        ⦿ : 누르는 점  
        🔴 : 통증을 느끼는 구역  
      `,
      image: '/images/example-pain.png'
    },
    {
      id: 4,
      type: 'checkbox',
      stepLabel: '4 / 11',
      question: '딸깍 소리가 언제 발생하나요? (중복선택 가능)',
      multiple: true,
      options: [
        '벌리기 시작',
        '편안히 벌리기 (회전 운동)',
        '최대 벌리기 (아탈구)',
        '닫으려 할 때 (아탈구 정복)',
        '완전 닫기 (회전 운동)',
        '좌우로 움직일 때'
      ]
    },
    {
      id: 5,
      type: 'video',
      stepLabel: '5 / 11',
      question: '딸깍 소리가 언제 발생하나요? (중복선택 가능)',
      src: '/videos/open-close-demo.mp4'
    },
    {
      id: 6,
      type: 'radio',
      stepLabel: '6 / 11',
      question: '누른 상태에서 🔴 영역에 통증이 있나요?',
      multiple: false,
      options: ['눌렀을 때 통증 있음', '통증 없음']
    },
    {
      id: 7,
      type: 'slider',
      stepLabel: '7 / 11',
      question: '스트레스 레벨을 알려주세요.',
      min: 0,
      max: 100
    },
    {
      id: 8,
      type: 'date',
      stepLabel: '8 / 11',
      question: '다음 예약 날짜를 선택해주세요.'
    },
    {
      id: 9,
      type: 'text',
      stepLabel: '9 / 11',
      question: '기타 불편사항이 있으시면 자유롭게 입력해주세요.',
      placeholder: '예) 아침에 주로 통증 발생'
    },
    {
      id: 10,
      type: 'painScale',
      stepLabel: '10 / 11',
      question: '통증 강도를 선택해주세요.',
      min: 0,
      max: 10
    },
    {
      id: 11,
      type: 'multipleChoice',
      stepLabel: '11 / 11',
      question: '움직임이 힘들 때 스스로 해결이 가능한가요? (중복선택 가능)',
      multiple: true,
      options: [
        '항상 해결 가능',
        '가끔 가능 (가끔 불가능)',
        '항상 불가능 (다른 사람 도움 필요)',
        '없음'
      ]
    }
  ];
  