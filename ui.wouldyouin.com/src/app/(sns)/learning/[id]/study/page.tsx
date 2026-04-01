'use client';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Menu, X } from "lucide-react";
import { useLearningProgressStore } from "@/app/store/useLearningProgressStore";

interface Stage {
  id: string;
  title: string;
  steps: Step[];
}

interface Step {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

interface LearningProgress {
  content_id: string;
  last_stage_id?: string;
  last_step_id?: string;
  completed_stages: string[];
  completed_steps: string[];
  progress_pct?: number;
}

export default function LearningStudyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const {
    setCurrentContent,
    loadProgress,
    completeStep,
    saveProgress,
  } = useLearningProgressStore();
  
  const [loading, setLoading] = useState(true);
  const [showLoadingPopup, setShowLoadingPopup] = useState(true);
  const [stages, setStages] = useState<Stage[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [showTOC, setShowTOC] = useState(false);
  const [showTip, setShowTip] = useState(true); // 학습 시작 안내 문구 표시

  // 로딩 팝업 표시 후 학습 환경 로드
  useEffect(() => {
    if (!id) return;
    
    // Store에 현재 콘텐츠 설정
    setCurrentContent(id);
    
    // 로딩 팝업을 1.5초간 표시
    const loadingTimer = setTimeout(() => {
      setShowLoadingPopup(false);
      loadLearningEnvironment();
    }, 1500);

    return () => clearTimeout(loadingTimer);
  }, [id]);

  // 학습 시작 안내 문구 (1분 후 사라짐)
  useEffect(() => {
    if (!loading && !showLoadingPopup) {
      const tipTimer = setTimeout(() => {
        setShowTip(false);
      }, 60000); // 1분 = 60000ms

      return () => clearTimeout(tipTimer);
    }
  }, [loading, showLoadingPopup]);

  // 페이지 이탈 시 마지막 포인트 저장
  useEffect(() => {
    if (!id || !currentStageId || !currentStepId) return;

    const saveProgressOnExit = async () => {
      try {
        // visibilitychange에서는 일반 fetch 사용 (sendBeacon은 헤더 설정 불가)
        await fetch(`/api/learning/${id}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage_id: currentStageId,
            step_id: currentStepId,
            completed_stages: progress?.completed_stages || [],
            completed_steps: progress?.completed_steps || [],
            progress_pct: progress?.progress_pct || 0,
          }),
          keepalive: true, // 페이지 이탈 시에도 요청 완료 보장
        });
      } catch (err) {
        console.error('[LearningStudy] 페이지 이탈 시 저장 실패:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveProgressOnExit();
      }
    };

    const handleBeforeUnload = () => {
      // beforeunload에서는 sendBeacon 사용 (헤더 없이 쿠키로 인증)
      const data = JSON.stringify({
        stage_id: currentStageId,
        step_id: currentStepId,
        completed_stages: progress?.completed_stages || [],
        completed_steps: progress?.completed_steps || [],
        progress_pct: progress?.progress_pct || 0,
      });
      
      const blob = new Blob([data], { type: 'application/json' });
      navigator.sendBeacon(`/api/learning/${id}/progress`, blob);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [id, currentStageId, currentStepId, progress]);

  async function loadLearningEnvironment() {
    try {
      // 학습 콘텐츠와 진행 상태를 동시에 로드
      const [contentRes, progressRes] = await Promise.all([
        fetch(`/api/learning/${id}`),
        fetch(`/api/learning/${id}/progress`),
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        if (contentData.success && contentData.data) {
          // content에서 stages 파싱 (JSON 형식으로 저장되어 있다고 가정)
          const content = contentData.data.content || '';
          // 간단한 파싱 로직 (실제로는 content가 JSON이거나 구조화된 형식일 수 있음)
          // 여기서는 예시로 더미 데이터 생성
          const parsedStages = parseStagesFromContent(content, contentData.data.stage_count || 0);
          setStages(parsedStages);
          
          // 진행 상태에 따라 현재 stage/step 설정
          const loadedProgress = await loadProgress(id);
          if (loadedProgress) {
            setProgress(loadedProgress);
            const lastStageId = loadedProgress.last_stage_id;
            const lastStepId = loadedProgress.last_step_id;
            const completedSteps = loadedProgress.completed_steps || [];
            
            // 완료된 step 표시 업데이트
            setStages(prev => prev.map(stage => ({
              ...stage,
              steps: stage.steps.map(step => ({
                ...step,
                completed: completedSteps.includes(step.id),
              })),
            })));
            
            if (lastStageId && lastStepId) {
              // 마지막 학습 위치로 이동
              const lastStage = parsedStages.find(s => s.id === lastStageId);
              const lastStep = lastStage?.steps.find(s => s.id === lastStepId);
              
              if (lastStage && lastStep) {
                setCurrentStageId(lastStageId);
                setCurrentStepId(lastStepId);
              } else if (parsedStages.length > 0) {
                // 마지막 위치를 찾을 수 없으면 첫 번째로
                setCurrentStageId(parsedStages[0].id);
                setCurrentStepId(parsedStages[0].steps[0]?.id || null);
              }
            } else if (parsedStages.length > 0) {
              // 진행 상태가 없으면 첫 번째 stage의 첫 번째 step
              setCurrentStageId(parsedStages[0].id);
              setCurrentStepId(parsedStages[0].steps[0]?.id || null);
            }
          } else if (parsedStages.length > 0) {
            setCurrentStageId(parsedStages[0].id);
            setCurrentStepId(parsedStages[0].steps[0]?.id || null);
          }
        }
      }
    } catch (err) {
      console.error("[LearningStudy] 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  }

  // content에서 stages 파싱
  function parseStagesFromContent(content: string, stageCount: number): Stage[] {
    try {
      // content가 JSON 형식인 경우 파싱
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((stage: any, idx: number) => ({
          id: stage.id || `stage-${idx + 1}`,
          title: stage.title || `Stage ${idx + 1}`,
          steps: (stage.steps || []).map((step: any, stepIdx: number) => ({
            id: step.id || `step-${idx + 1}-${stepIdx + 1}`,
            title: step.title || `Step ${stepIdx + 1}`,
            content: step.content || step.text || '',
            completed: step.completed || false,
          })),
        }));
      }
    } catch {
      // JSON 파싱 실패 시 HTML에서 구조 추출 시도
    }
    
    // 기본값: stage_count 기반으로 더미 데이터 생성
    const stages: Stage[] = [];
    const count = Math.max(stageCount || 3, 3);
    for (let i = 0; i < count; i++) {
      stages.push({
        id: `stage-${i + 1}`,
        title: `Stage ${i + 1}`,
        steps: [
          { id: `step-${i + 1}-1`, title: `Step 1`, content: `Stage ${i + 1}의 첫 번째 단계입니다.`, completed: false },
          { id: `step-${i + 1}-2`, title: `Step 2`, content: `Stage ${i + 1}의 두 번째 단계입니다.`, completed: false },
        ],
      });
    }
    return stages;
  }

  const currentStage = stages.find(s => s.id === currentStageId);
  const currentStep = currentStage?.steps.find(s => s.id === currentStepId);

  // Step 완료 처리 (Store를 통한 실시간 저장)
  async function markStepComplete(stageId: string, stepId: string) {
    // Store를 통해 즉시 저장 (내부에서 API 호출)
    await completeStep(stageId, stepId);
    
    // 로컬 상태 업데이트
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? {
            ...stage,
            steps: stage.steps.map(step =>
              step.id === stepId ? { ...step, completed: true } : step
            ),
          }
        : stage
    ));
    
    // Store에서 업데이트된 progress 가져오기
    const updatedProgress = useLearningProgressStore.getState().currentProgress;
    if (updatedProgress) {
      setProgress(updatedProgress);
    }
  }

  // 학습 종료 처리
  async function handleLearningEnd() {
    if (!id || !currentStageId || !currentStepId) {
      router.push(`/learning/${id}`);
      return;
    }

    try {
      // 현재 진행 상태 저장
      await saveProgress(id, {
        last_stage_id: currentStageId,
        last_step_id: currentStepId,
        completed_stages: progress?.completed_stages || [],
        completed_steps: progress?.completed_steps || [],
        progress_pct: progress?.progress_pct || 0,
      });

      // 상세 페이지로 이동
      router.push(`/learning/${id}`);
    } catch (err) {
      console.error('[LearningStudy] 학습 종료 저장 실패:', err);
      // 저장 실패해도 이동
      router.push(`/learning/${id}`);
    }
  }

  if (showLoadingPopup) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-semibold text-gray-900">학습 환경을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* 학습 시작 안내 문구 */}
      {showTip && !loading && !showLoadingPopup && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 shadow-md animate-in fade-in duration-300">
          <p className="text-xs text-blue-700 text-center">
            학습종료하고 오늘의 진도율을 체크해보세요!
          </p>
        </div>
      )}

      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLearningEnd}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            학습 종료
          </button>
          <button
            onClick={() => setShowTOC(!showTOC)}
            className="p-1"
            title="목차"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 목차 사이드바 */}
        {showTOC && (
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-bold text-sm mb-3">목차</h3>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <div key={stage.id} className="space-y-1">
                    <button
                      onClick={() => {
                        setCurrentStageId(stage.id);
                        setCurrentStepId(stage.steps[0]?.id || null);
                        setShowTOC(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm font-medium ${
                        currentStageId === stage.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {stage.title}
                    </button>
                    <div className="pl-4 space-y-0.5">
                      {stage.steps.map((step) => (
                        <button
                          key={step.id}
                          onClick={() => {
                            setCurrentStageId(stage.id);
                            setCurrentStepId(step.id);
                            setShowTOC(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex items-center gap-2 ${
                            currentStepId === step.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          {step.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {currentStep ? (
            <div className="max-w-3xl mx-auto p-6">
              <div className="mb-4">
                <span className="text-xs text-gray-500">{currentStage?.title}</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{currentStep.title}</h2>
              </div>
              
              <div className="prose prose-sm max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              </div>

              {/* 다음 단계로 이동 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // 현재 step 완료 처리
                    markStepComplete(currentStageId!, currentStepId!);
                    
                    // 다음 step으로 이동
                    const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
                    const currentStepIndex = currentStage!.steps.findIndex(s => s.id === currentStepId);
                    
                    if (currentStepIndex < currentStage!.steps.length - 1) {
                      // 같은 stage의 다음 step
                      setCurrentStepId(currentStage!.steps[currentStepIndex + 1].id);
                    } else if (currentStageIndex < stages.length - 1) {
                      // 다음 stage의 첫 step
                      setCurrentStageId(stages[currentStageIndex + 1].id);
                      setCurrentStepId(stages[currentStageIndex + 1].steps[0]?.id || null);
                    } else {
                      // 모든 학습 완료
                      alert('모든 학습을 완료했습니다!');
                    }
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  다음 단계
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen className="w-14 h-14 mb-3 opacity-30" />
              <p className="text-sm">학습 콘텐츠를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
