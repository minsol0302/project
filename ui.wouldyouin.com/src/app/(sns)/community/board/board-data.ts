export interface BoardComment {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface BoardPostDetail {
  id: string;
  title: string;
  author: string;
  body: string;
  created_at: string;
  initialComments: BoardComment[];
}

const t = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

const DETAILS: Record<string, Omit<BoardPostDetail, "id">> = {
  seed_1: {
    title: "원격 근무 가능한 회사 추천 부탁드려요",
    author: "seoyeon.park",
    created_at: t(2),
    body: `안녕하세요. 프론트엔드 개발자로 이직을 준비 중인데, 재택·원격 위주로 협업 문화가 잘 잡혀 있는 회사를 찾고 있어요. 출퇴근 부담을 줄이고 싶은데, 실제로 원격 근무가 제도로 보장되는 곳이 잘 없더라고요.

혹시 다니시거나 지인분들께 들은 회사 중에 추천해 주실 만한 곳이 있을까요? (스타트업·중견 모두 괜찮습니다.)`,
    initialComments: [
      {
        id: "seed_1_c1",
        author: "minho_lee",
        body: "저희 팀은 주 2회 재택이 원칙이에요. 규모 있는 IT 서비스사 중에도 제도가 비슷한 곳 꽤 있으니 공고에 ‘하이브리드’ 키워드로 검색해 보세요.",
        created_at: t(1.5),
      },
      {
        id: "seed_1_c2",
        author: "dabin.dev",
        body: "A사는 타임존만 맞추면 비동기 협업이 가능하다고 들었어요. 다만 팀마다 문화 차이가 커서 면접 때 재택 비율을 꼭 물어보는 게 좋아요.",
        created_at: t(1),
      },
      {
        id: "seed_1_c3",
        author: "jihye.kim",
        body: "완전 재택만 노리면 공고 수가 확 줄어서, 일단 하이브리드로 들어가서 내부에서 조율하는 경우도 많더라고요. 레퍼런스로 B사도 한번 보세요.",
        created_at: t(0.5),
      },
      {
        id: "seed_1_c4",
        author: "taeho.song",
        body: "저는 스타트업 커뮤니티에서 소개받은 곳으로 이직했어요. 채용 페이지보다 블라인드·링크드인 후기가 도움이 됐습니다.",
        created_at: t(0.4),
      },
      {
        id: "seed_1_c5",
        author: "jiwon.choi",
        body: "계약서에 재택 일수가 명시돼 있는지 꼭 확인하세요. 말로만 되는 경우도 있더라고요.",
        created_at: t(0.35),
      },
      {
        id: "seed_1_c6",
        author: "yuna.jung",
        body: "타임존 맞추기 힘들면 해외 클라이언트 있는 팀은 피하는 게 스트레스 덜 받아요.",
        created_at: t(0.25),
      },
      {
        id: "seed_1_c7",
        author: "seoyeon.park",
        body: "댓글 감사합니다. 하이브리드부터 알아볼게요!",
        created_at: t(0.1),
      },
    ],
  },
  seed_2: {
    title: "프론트엔드 커리어 전환 고민입니다 (비전공자)",
    author: "minho_lee",
    created_at: t(20),
    body: "비전공자로 부트캠프만 수료한 상태인데, 포트폴리오 위주로 준비하면 될까요? 현직자분들 조언 부탁드립니다.",
    initialComments: [
      {
        id: "seed_2_c1",
        author: "dabin.dev",
        body: "프로젝트 하나를 끝까지 배포·운영까지 해보는 게 가장 설득력 있어요.",
        created_at: t(18),
      },
    ],
  },
  seed_3: {
    title: "서울에서 사이드 프로젝트 같이 하실 분 계신가요",
    author: "jihye.kim",
    created_at: t(48),
    body: "주말에만 만나서 MVP 만드는 팀을 꾸리고 싶어요. 백엔드·디자인 한 분씩 구합니다.",
    initialComments: [],
  },
  seed_4: {
    title: "면접 과제 준비 팁 공유합니다",
    author: "dabin.dev",
    created_at: t(72),
    body: "제가 최근 과제 통과했을 때 신경 쓴 점들 정리해 봤어요. README와 커밋 메시지부터가 첫인상입니다.",
    initialComments: [],
  },
  seed_5: {
    title: "신입 백엔드 포트폴리오 피드백 부탁드려요",
    author: "jiwon.choi",
    created_at: t(96),
    body: "Spring 기반 CRUD + 배포까지 넣었는데, 어떤 부분을 더 보강하면 좋을지 봐주시면 감사하겠습니다.",
    initialComments: [],
  },
  seed_6: {
    title: "요즘 협업 툴은 어떤 조합으로 쓰시나요?",
    author: "taeho.song",
    created_at: t(120),
    body: "슬랙+노션+피그마 조합이 흔한가요? 팀 규모별로 추천해 주시면 참고하겠습니다.",
    initialComments: [],
  },
  seed_7: {
    title: "커뮤니티 스터디 시작 전에 체크할 것들",
    author: "yuna.jung",
    created_at: t(144),
    body: "스터디 팀장으로 처기 모집 중인데, 규칙부터 정하는 게 맞을까요?",
    initialComments: [],
  },
};

export function getBoardPostDetail(id: string): BoardPostDetail | undefined {
  const row = DETAILS[id];
  if (!row) return undefined;
  return { id, ...row };
}

export const BOARD_EXTRA_COMMENTS_KEY_PREFIX = "vding_board_extra_comments_";

/** 로컬 게시글·댓글 작성자 표시명 (글쓰기 기본값과 동일). */
export const BOARD_LOCAL_AUTHOR_NAME = "vdingadmin";
