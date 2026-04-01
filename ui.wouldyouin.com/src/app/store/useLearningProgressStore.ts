import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningProgress {
  content_id: string;
  last_stage_id?: string;
  last_step_id?: string;
  completed_stages: string[];
  completed_steps: string[];
  progress_pct: number;
}

interface LearningProgressState {
  // 현재 학습 중인 콘텐츠
  currentContentId: string | null;
  currentProgress: LearningProgress | null;
  
  // 실시간 로그 (Draft)
  draftLogs: Array<{
    content_id: string;
    stage_id: string;
    step_id: string;
    timestamp: number;
  }>;
  
  // 액션
  setCurrentContent: (contentId: string) => void;
  setProgress: (progress: LearningProgress) => void;
  completeStep: (stageId: string, stepId: string) => Promise<void>;
  saveProgress: (contentId: string, progress: Partial<LearningProgress>) => Promise<void>;
  loadProgress: (contentId: string) => Promise<LearningProgress | null>;
  addDraftLog: (stageId: string, stepId: string) => void;
  clearDraftLogs: () => void;
}

export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set, get) => ({
      currentContentId: null,
      currentProgress: null,
      draftLogs: [],

      setCurrentContent: (contentId: string) => {
        set({ currentContentId: contentId });
      },

      setProgress: (progress: LearningProgress) => {
        set({ currentProgress: progress });
      },

      completeStep: async (stageId: string, stepId: string) => {
        const { currentContentId, currentProgress } = get();
        if (!currentContentId) return;

        // 로컬 상태 즉시 업데이트
        const updatedProgress: LearningProgress = {
          content_id: currentContentId,
          last_stage_id: stageId,
          last_step_id: stepId,
          completed_stages: currentProgress?.completed_stages || [],
          completed_steps: [...(currentProgress?.completed_steps || []), stepId],
          progress_pct: currentProgress?.progress_pct || 0,
        };

        // stage 완료 체크 (해당 stage의 모든 step이 완료되었는지)
        // 이 부분은 실제 stage/step 구조에 맞게 수정 필요
        if (!updatedProgress.completed_stages.includes(stageId)) {
          updatedProgress.completed_stages.push(stageId);
        }

        set({ currentProgress: updatedProgress });

        // Draft 로그 추가
        get().addDraftLog(stageId, stepId);

        // 즉시 서버에 저장
        try {
          await fetch(`/api/learning/${currentContentId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stage_id: stageId,
              step_id: stepId,
              completed: true,
            }),
          });
        } catch (err) {
          console.error('[LearningProgressStore] 저장 실패:', err);
        }
      },

      saveProgress: async (contentId: string, progress: Partial<LearningProgress>) => {
        try {
          await fetch(`/api/learning/${contentId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stage_id: progress.last_stage_id,
              step_id: progress.last_step_id,
              completed_stages: progress.completed_stages,
              completed_steps: progress.completed_steps,
              progress_pct: progress.progress_pct,
            }),
          });
        } catch (err) {
          console.error('[LearningProgressStore] 진행 상태 저장 실패:', err);
        }
      },

      loadProgress: async (contentId: string): Promise<LearningProgress | null> => {
        try {
          const res = await fetch(`/api/learning/${contentId}/progress`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              const progress: LearningProgress = {
                content_id: contentId,
                last_stage_id: data.data.last_stage_id,
                last_step_id: data.data.last_step_id,
                completed_stages: data.data.completed_stages || [],
                completed_steps: data.data.completed_steps || [],
                progress_pct: data.data.progress_pct || 0,
              };
              set({ currentContentId: contentId, currentProgress: progress });
              return progress;
            }
          }
        } catch (err) {
          console.error('[LearningProgressStore] 진행 상태 불러오기 실패:', err);
        }
        return null;
      },

      addDraftLog: (stageId: string, stepId: string) => {
        const { currentContentId, draftLogs } = get();
        if (!currentContentId) return;

        const newLog = {
          content_id: currentContentId,
          stage_id: stageId,
          step_id: stepId,
          timestamp: Date.now(),
        };

        set({
          draftLogs: [...draftLogs, newLog].slice(-50), // 최근 50개만 유지
        });
      },

      clearDraftLogs: () => {
        set({ draftLogs: [] });
      },
    }),
    {
      name: 'learning-progress-storage',
      partialize: (state) => ({
        currentContentId: state.currentContentId,
        currentProgress: state.currentProgress,
        draftLogs: state.draftLogs,
      }),
    }
  )
);
