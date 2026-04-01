/**
 * VDing Project Store (Zustand + persist → sessionStorage)
 *
 * project_id 같은 민감 정보를 URL 쿼리스트링에 노출하지 않고
 * sessionStorage에 암묵적으로 보관합니다.
 * 새로고침해도 세션이 살아있는 동안 데이터가 유지됩니다.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface VdingProject {
  projectId: string;   // DB PK (UUID) — URL에 노출 금지
  ideaText: string;    // 사용자가 입력한 아이디어 원문
  categoryId: string;  // 선택한 카테고리 (sns, edtech …)
  themeId: string;     // 선택한 UI 테마 (feed_centric, content_learning …)
  // AI 생성 콘텐츠 (V 버튼 호출 후 저장)
  previewData?: Record<string, unknown>;
  navConfig?: { app_name: string; tabs: { id: string; label: string; icon: string }[] };
  aiGeneratedAt?: string; // ISO timestamp
}

interface VdingState {
  project: VdingProject | null;
  /** 아이디어 저장 직후 — 프로젝트 전체 교체 */
  setProject: (p: VdingProject) => void;
  /** 카테고리/테마 선택 시 — 부분 업데이트 */
  updateProject: (partial: Partial<VdingProject>) => void;
  /** 프로젝트 완성 후 or 로그아웃 시 초기화 */
  clearProject: () => void;
}

export const useVdingStore = create<VdingState>()(
  persist(
    (set) => ({
      project: null,

      setProject: (project) => set({ project }),

      updateProject: (partial) =>
        set((state) => ({
          project: state.project
            ? { ...state.project, ...partial }
            : (partial as VdingProject),
        })),

      clearProject: () => set({ project: null }),
    }),
    {
      name: "vding-project",                          // sessionStorage 키
      storage: createJSONStorage(() => sessionStorage), // 탭 닫으면 자동 삭제
    },
  ),
);
