export interface Contest {
  id: string;
  title: string;
  host: string;
  dday: string;
  prize: string;
  tags: string[];
}

export interface ContestDetail extends Contest {
  background: string;
  topic: string;
  description: string;
  /** 최종 신청·문의 링크 (웹 또는 mailto) */
  applyUrl: string;
}

export const MOCK_CONTESTS: Contest[] = [
  { id: "contest_1", title: "청년 사회문제 해결 아이디어톤", host: "서울창업허브", dday: "D-6", prize: "대상 700만원", tags: ["아이디어", "사회혁신"] },
  { id: "contest_2", title: "2026 데이터 시각화 챌린지", host: "데이터얼라이언스", dday: "D-9", prize: "총상금 1,200만원", tags: ["데이터", "시각화"] },
  { id: "contest_3", title: "UX 리서치 실전 공모전", host: "UX랩 코리아", dday: "D-12", prize: "최우수상 400만원", tags: ["UX", "리서치"] },
  { id: "contest_4", title: "지속가능 도시 서비스 해커톤", host: "그린시티포럼", dday: "D-14", prize: "대상 600만원", tags: ["환경", "서비스"] },
  { id: "contest_5", title: "핀테크 앱 리디자인 콘테스트", host: "핀랩", dday: "D-17", prize: "우수상 300만원", tags: ["핀테크", "디자인"] },
  { id: "contest_6", title: "로컬 커머스 성장 전략 공모전", host: "리테일인사이트", dday: "D-18", prize: "총상금 900만원", tags: ["커머스", "전략"] },
  { id: "contest_7", title: "AI 기반 학습도구 기획전", host: "에듀테크협회", dday: "D-20", prize: "대상 500만원", tags: ["AI", "에듀테크"] },
  { id: "contest_8", title: "공공데이터 활용 서비스 기획", host: "공공데이터재단", dday: "D-22", prize: "최우수상 350만원", tags: ["공공데이터", "기획"] },
  { id: "contest_9", title: "문화예술 플랫폼 신규 기능 제안전", host: "아트브릿지", dday: "D-24", prize: "우수상 250만원", tags: ["플랫폼", "문화예술"] },
  { id: "contest_10", title: "헬스케어 사용자 경험 개선 챌린지", host: "메디UX", dday: "D-25", prize: "대상 450만원", tags: ["헬스케어", "UX"] },
  { id: "contest_11", title: "모빌리티 서비스 혁신 아이디어 공모", host: "모빌코리아", dday: "D-27", prize: "총상금 800만원", tags: ["모빌리티", "혁신"] },
  { id: "contest_12", title: "스마트오피스 생산성 앱 기획전", host: "워크플로우랩", dday: "D-28", prize: "장려상 200만원", tags: ["생산성", "B2B"] },
];

const GENERIC_DETAIL = (
  host: string,
  title: string
): Pick<ContestDetail, "background" | "topic" | "description"> => ({
  background: `${host}에서 진행하는 「${title}」입니다. 사회·산업 현장의 과제를 주제로 참가자의 창의적 아이디어와 실행 가능성을 평가합니다. 많은 관심과 참여 부탁드립니다.`,
  topic: "주최측이 제시하는 과제 범위 안에서 독창적인 기획·디자인·프로토타입을 제출하는 것을 목표로 합니다.",
  description:
    "참가 자격, 제출 형식, 심사 기준 및 일정은 주최 공지를 기준으로 합니다. 문의는 주최처 공식 채널을 이용해 주세요.",
});

const DETAILS: Record<
  string,
  Pick<ContestDetail, "background" | "topic" | "description"> & { applyUrl?: string }
> = {
  contest_1: {
    background: `안녕하세요! 서울창업허브가 주관하는 「청년 사회문제 해결 아이디어톤」에 오신 것을 환영합니다.

우리 사회는 교육·일자리·주거·환경·디지털 격차 등 다양한 영역에서 복합적인 과제를 안고 있습니다. 청년 여러분의 시선에서 발견되는 문제 정의와, 그에 맞는 실험적·실행 가능한 아이디어는 앞으로의 정책과 서비스 설계에 중요한 단서가 됩니다.

본 아이디어톤은 팀 단위로 사회 문제를 탐색하고, 구체적인 해결 방향을 제안하며, 간단한 검증 계획까지 담아 제출하는 것을 목표로 합니다. 현장의 목소리와 데이터를 바탕으로, “누구를 위한 해결인지”가 드러나는 기획을 기대합니다.

참가자 여러분의 통찰과 열정이 실제 변화로 이어질 수 있도록, 멘토링과 네트워킹 기회도 함께 마련되어 있습니다. 여러분의 아이디어로 지역과 공동체에 긍정적인 파동을 만들어 주세요.`,
    topic:
      "서울·수도권 청년이 체감하는 사회 문제를 선정하고, 이를 해결하기 위한 서비스·정책·캠페인 등 실행 가능한 아이디어를 한 문장으로 요약하여 제안할 것.",
    description: `• 참가 대상: 만 19세 이상 39세 이하 청년(팀 3~5인 권장, 개인 참가 가능)
• 제출물: 문제 정의서(1p), 솔루션 개요(3p 이내), 실행·검증 계획(1p), 팀 구성·역할
• 형식: PDF 업로드, 발표는 예선·본선 일정에 따라 오프라인 또는 온라인
• 심사: 사회적 임팩트(40%), 실현 가능성(30%), 참신성(20%), 팀 역량·완성도(10%)
• 유의: 타 공모전 수상작·표절·허위 사실이 확인될 경우 심사 대상에서 제외될 수 있습니다.
• 상금: 대상 700만원 외 입상작 별도 시상(세부는 공지 참조)

신청 마감 및 본선 일정은 상단 D-day 및 주최 공지를 확인해 주세요.`,
    applyUrl: "https://www.seoulstartuphub.com",
  },
};

export function getContestDetail(id: string): ContestDetail | undefined {
  const base = MOCK_CONTESTS.find((c) => c.id === id);
  if (!base) return undefined;

  const extra = DETAILS[id] ?? GENERIC_DETAIL(base.host, base.title);
  const applyUrl =
    "applyUrl" in extra && extra.applyUrl
      ? extra.applyUrl
      : `mailto:?subject=${encodeURIComponent(`[${base.title}] 신청 문의`)}`;
  return { ...base, ...extra, applyUrl };
}
