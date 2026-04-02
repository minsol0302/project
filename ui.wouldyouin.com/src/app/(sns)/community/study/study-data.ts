export interface StudyGroup {
  id: string;
  name: string;
  day: string;
  location: string;
  members: string;
  tag: string;
}

export interface StudyDetail extends StudyGroup {
  status: string;
  applyUrl: string;
  intro: string;
  goals: string;
  howWeRun: string;
  targetAudience: string;
  notices: string;
}

export const MOCK_STUDIES: StudyGroup[] = [
  { id: "study_1", name: "프론트엔드 취업 스터디 (React/TypeScript)", day: "매주 화 목 저녁", location: "온라인", members: "6/8명", tag: "취업 준비" },
  { id: "study_2", name: "백엔드 시스템 설계 스터디", day: "매주 수요일 밤", location: "온라인 (Discord)", members: "5/7명", tag: "백엔드" },
  { id: "study_3", name: "SQL 실전 문제 풀이 모임", day: "주 2회 점심", location: "온라인", members: "7/10명", tag: "데이터" },
  { id: "study_4", name: "알고리즘 코딩 테스트 집중반", day: "매주 월 금", location: "서울 홍대", members: "8/10명", tag: "코테" },
  { id: "study_5", name: "PM 케이스 스터디", day: "격주 토요일", location: "판교", members: "3/6명", tag: "기획" },
  { id: "study_6", name: "UI 리디자인 챌린지", day: "매주 일요일 오전", location: "서울 성수", members: "5/8명", tag: "디자인" },
  { id: "study_7", name: "영어 발표 스터디 (직장인)", day: "주 1회 저녁", location: "온라인 (Zoom)", members: "10/12명", tag: "커뮤니케이션" },
  { id: "study_8", name: "서비스 기획 문서 리뷰 모임", day: "매주 토요일 오후", location: "서울 강남", members: "4/6명", tag: "서비스기획" },
  { id: "study_9", name: "모바일 앱 출시 스프린트 그룹", day: "매주 목요일", location: "대전", members: "5/7명", tag: "앱개발" },
  { id: "study_10", name: "브랜딩 카피라이팅 스터디", day: "격주 수요일", location: "부산", members: "6/9명", tag: "브랜딩" },
  { id: "study_11", name: "제품 데이터 분석 리딩클럽", day: "매주 화요일", location: "온라인", members: "4/7명", tag: "분석" },
  { id: "study_12", name: "QA 자동화 테스트 실습반", day: "매주 금요일 밤", location: "서울 문래", members: "5/8명", tag: "테스트" },
];

const DETAILS: Record<string, Omit<StudyDetail, keyof StudyGroup | "applyUrl">> = {
  study_1: {
    status: "모집중",
    intro: `React와 TypeScript를 중심으로 프론트엔드 취업을 준비하는 스터디입니다. 혼자 공부하기 막막한 분들이 모여 매주 두 번, 짧게라도 꾸준히 몸에 익히는 것을 목표로 합니다.

온라인(화상)으로 진행하며, 라이브 코딩·과제 리뷰·모의 면접을 번갈아 가며 진행할 예정입니다.`,
    goals: `• React 기본기(훅, 상태 관리, 렌더링 흐름)를 실무 수준으로 다지기
• TypeScript로 컴포넌트·API 타입을 안전하게 설계하는 연습
• 포트폴리오 프로젝트 1개를 끝까지 완성하고 피드백 받기
• 코딩 테스트·기술 면접 질문을 함께 정리하고 모의 면접 1회 이상`,
    howWeRun: `• 일정: 매주 화·목 저녁 (1회당 약 2시간, 시간은 투표로 조정 가능)
• 장소: 온라인 (Discord 음성 + 화면 공유)
• 진행: 주차별 과제 → 코드 리뷰 → 다음 주제 선정
• 인원: 최대 8명 (현재 6명 참여 중, 2자리 남음)
• 비용: 무료 (도서·강의 공동 구매는 선택)`,
    targetAudience: `• 프론트엔드로 첫 이직·취업을 목표로 하시는 분
• HTML/CSS/JavaScript 기초는 있으나 React·TS를 체계적으로 다져보고 싶은 분
• 매주 과제와 리뷰에 성실히 참여할 수 있는 분`,
    notices: `• 첫 모임 전 간단한 자기소개와 현재 학습 수준을 공유해 주세요.
• 무단 이탈이 잦을 경우 다음 기수 참여가 제한될 수 있습니다.`,
  },
};

function genericDetail(s: StudyGroup): Omit<StudyDetail, keyof StudyGroup | "applyUrl"> {
  return {
    status: "모집중",
    intro: `「${s.name}」은(는) ${s.day}에 ${s.location}에서 진행하는 스터디 모임입니다. 상세 커리큘럼은 모임에서 공유됩니다.`,
    goals: `• 함께 학습 목표를 정하고 주기적으로 점검합니다.
• 참가자 수준에 맞춰 과제와 발표 형식을 조정합니다.`,
    howWeRun: `• 일정: ${s.day}
• 장소: ${s.location}
• 인원: ${s.members}`,
    targetAudience: `• 해당 주제에 관심 있으신 분
• 스터디 규칙과 일정을 지킬 수 있는 분`,
    notices: `• 문의 및 신청은 아래 「신청하기」를 이용해 주세요.`,
  };
}

export function getStudyDetail(id: string): StudyDetail | undefined {
  const base = MOCK_STUDIES.find((s) => s.id === id);
  if (!base) return undefined;

  const extra = DETAILS[id] ?? genericDetail(base);
  const applyUrl = `mailto:?subject=${encodeURIComponent(`[스터디 신청] ${base.name}`)}`;

  return { ...base, ...extra, applyUrl };
}
