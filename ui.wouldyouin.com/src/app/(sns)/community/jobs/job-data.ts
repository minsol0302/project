export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
}

export interface JobDetail extends Job {
  dday: string;
  applyUrl: string;
  /** 상단 요약 표 (라벨 / 값, 일부 값 강조색) */
  primaryRows: { label: string; value: string; accent?: boolean }[];
  secondaryRows: { label: string; value: string }[];
  mainTasks: string;
  qualifications: string;
  preferred: string;
  workConditionSection: string;
  benefitsSection: string;
  processSection: string;
  noticeSection: string;
}

export const MOCK_JOBS: Job[] = [
  { id: "job_1", title: "주니어 프론트엔드 개발자", company: "오르빗랩", location: "서울 성수", type: "정규직" },
  { id: "job_2", title: "백엔드 개발자 (Node.js)", company: "넥스트웨이브", location: "판교", type: "정규직" },
  { id: "job_3", title: "프로덕트 디자이너", company: "모션픽셀", location: "서울 을지로", type: "정규직" },
  { id: "job_4", title: "데이터 분석가", company: "인사이트허브", location: "원격", type: "계약직" },
  { id: "job_5", title: "콘텐츠 마케터", company: "브랜드스케일", location: "서울 강남", type: "정규직" },
  { id: "job_6", title: "QA 엔지니어", company: "테스트포지", location: "부산", type: "정규직" },
  { id: "job_7", title: "모바일 앱 개발자 (Flutter)", company: "앱브릿지", location: "대전", type: "정규직" },
  { id: "job_8", title: "사업개발 매니저", company: "비즈플로우", location: "서울 여의도", type: "정규직" },
  { id: "job_9", title: "AI 엔지니어", company: "딥노트", location: "판교", type: "정규직" },
  { id: "job_10", title: "서비스 기획자", company: "프로덕트웍스", location: "서울 홍대", type: "정규직" },
  { id: "job_11", title: "인사 운영 매니저", company: "피플앤컬처", location: "서울 시청", type: "계약직" },
  { id: "job_12", title: "브랜드 영상 PD", company: "크리에이티브독", location: "서울 합정", type: "인턴" },
];

const DETAILS: Record<string, Omit<JobDetail, keyof Job | "applyUrl">> = {
  job_1: {
    dday: "D-18",
    primaryRows: [
      { label: "경력", value: "신입 ~ 경력 3년" },
      { label: "학력", value: "대졸(4년제) 이상", accent: true },
      { label: "근무형태", value: "정규직 (수습기간 3개월)", accent: true },
      { label: "자격요건", value: "아래 상세 내용 참고" },
      { label: "우대사항", value: "아래 상세 내용 참고" },
    ],
    secondaryRows: [
      { label: "급여", value: "면접 후 결정" },
      { label: "직급/직책", value: "팀원" },
      { label: "근무일시", value: "주 5일(월~금) 09:00~18:00" },
      { label: "근무지역", value: "서울 성수동 (역 도보 8분)" },
    ],
    mainTasks: `[프로덕트 UI 구현]
• 디자인 시스템과 가이드를 바탕으로 웹·앱 화면을 구현하고, 반응형·접근성을 고려합니다.

[협업 및 품질]
• 기획·디자인·백엔드와 협업하여 API 연동, 상태 관리, 성능 이슈를 함께 해결합니다.

[기술 기여]
• 코드 리뷰와 문서화에 참여하고, 사내 공통 컴포넌트·툴링 개선에 기여합니다.

프론트엔드 파트 소속으로 주니어 포지션을 함께할 예정이에요.`,
    qualifications: `• 경력: 신입 또는 관련 경력 3년 이하
• 학력: 대학교 졸업(4년제) 이상

[프론트엔드 기본기]
• HTML/CSS/JavaScript(ES6+)에 익숙하고, 브라우저 동작 원리를 이해하고 있을 것

[프레임워크]
• React(또는 Vue) 기반으로 SPA를 구성·배포해 본 경험

[협업]
• Git 기반 협업(Fork/PR) 경험, REST API 연동 경험

[태도]
• 사용자 관점에서 UI 품질을 고민하고, 학습·공유에 적극적인 분`,
    preferred: `[모던 툴체인]
• TypeScript, Vite/Next.js, 상태관리 라이브러리 경험

[품질·운영]
• 테스트(Jest/RTL 등), CI 경험, 웹 성능·번들 최적화 경험

[사이드 프로젝트]
• 포트폴리오 또는 오픈소스 기여 경험

[스타트업 적합성]
• 빠른 실행과 실패로부터 배우는 문화에 동의하시는 분`,
    workConditionSection: `• 고용형태: 정규직(수습 3개월)
• 급여: 면접 후 결정
• 근무지: 서울 성수동 OO빌딩 5층 (2호선 성수역 도보권)
• 근무일수/시간: 주 5일(월~금) 09:00~18:00 (점심 1시간)`,
    benefitsSection: `• 교육/생활: 온보딩 교육, 도서·세미나 비용 지원, 간식·음료
• 리프레시: 연차, 리프레시 휴가, 경조사 휴가
• 급여제도: 퇴직연금, 4대보험, 인센티브(성과 연동)
• 근무 환경: 모니터 2대 지원, 최신 장비, 자유로운 복장
• 문화: 수평 소통, 강제 야근·회식 없음, 재택·유연 근무 협의 가능`,
    processSection: `• 접수기간: 상시 채용 (채용 시 마감)
• 제출서류: 온라인 이력서, 포트폴리오(URL)
• 접수방법: 아래 「지원하기」 또는 담당자 이메일
• 전형절차: 서류전형 → 1차 실무 면접 → 2차 컬처핏 면접 → 최종합격`,
    noticeSection: `• 제출 서류에 허위 기재가 확인될 경우, 채용 확정 이후라도 채용이 취소될 수 있습니다.`,
  },
};

function genericDetail(job: Job): Omit<JobDetail, "applyUrl"> {
  return {
    ...job,
    dday: "D-30",
    primaryRows: [
      { label: "경력", value: "공고 참조" },
      { label: "학력", value: "학력 제한 없음", accent: true },
      { label: "근무형태", value: job.type, accent: true },
      { label: "자격요건", value: "상세 내용 참고" },
      { label: "우대사항", value: "상세 내용 참고" },
    ],
    secondaryRows: [
      { label: "급여", value: "면접 후 결정" },
      { label: "직급/직책", value: "팀원" },
      { label: "근무일시", value: "주 5일(월~금) (협의 가능)" },
      { label: "근무지역", value: `${job.location} (상세 주소는 합격 후 안내)` },
    ],
    mainTasks: `${job.company}의 「${job.title}」 포지션으로 배정된 팀에서 맡은 업무를 수행합니다. 구체적인 업무 범위는 면접 시 안내드립니다.`,
    qualifications: `• 지원 자격 및 경력 요건은 공고 및 면접을 통해 확인됩니다.
• 성실한 커뮤니케이션과 협업 태도를 갖추신 분을 환영합니다.`,
    preferred: `• 관련 분야 경험 및 포트폴리오가 있으시면 우대합니다.`,
    workConditionSection: `• 근무 형태: ${job.type}
• 급여: 면접 후 결정
• 근무지: ${job.location}
• 근무 시간: 회사 규정에 따름`,
    benefitsSection: `• 복지 항목은 회사 내규에 따르며, 면접 시 상세 안내가 가능합니다.`,
    processSection: `• 접수: 온라인 지원
• 전형: 서류 → 면접 → 최종합격 (포지션에 따라 상이할 수 있음)`,
    noticeSection: `• 채용과 관련된 정확한 사항은 기업 공식 공지를 확인해 주세요.`,
  };
}

export function getJobDetail(id: string): JobDetail | undefined {
  const base = MOCK_JOBS.find((j) => j.id === id);
  if (!base) return undefined;

  const extra = DETAILS[id] ?? genericDetail(base);
  const applyUrl =
    id === "job_1"
      ? `mailto:careers@orbitlab.example?subject=${encodeURIComponent("[지원] 주니어 프론트엔드 개발자")}`
      : `mailto:?subject=${encodeURIComponent(`[지원] ${base.title} · ${base.company}`)}`;

  return { ...base, ...extra, applyUrl };
}
