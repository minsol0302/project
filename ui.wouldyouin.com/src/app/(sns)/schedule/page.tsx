"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Plus, Edit2, Trash2, X, Check } from "lucide-react";

interface Schedule {
  id: string;
  date: string;
  title: string;
  description?: string;
  project_id?: string;
  learning_content_id?: string;
  project_name?: string;
  learning_title?: string;
  created_at: string;
  updated_at: string;
}

interface VdingProject {
  project_id: string;
  project_title: string;
}

interface LearningHistoryItem {
  id: string;
  content_id: string;
  content_title: string | null;
}

export default function SchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [projects, setProjects] = useState<VdingProject[]>([]);
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // 폼 상태
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formProjectId, setFormProjectId] = useState<string>("");
  const [formLearningId, setFormLearningId] = useState<string>("");

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, projectsRes, learningRes] = await Promise.all([
        fetch("/api/schedule", { credentials: "include" }),
        fetch("/api/vding/projects", { credentials: "include" }),
        fetch("/api/profile/learning-history", { credentials: "include" }),
      ]);

      if (schedulesRes.ok) {
        const data = await schedulesRes.json();
        if (data.success) {
          setSchedules(data.schedules || []);
        }
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }

      if (learningRes.ok) {
        const data = await learningRes.json();
        setLearningHistory(data.history || []);
      }
    } catch (err) {
      console.error("[SchedulePage] 데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormTitle("");
    setFormDescription("");
    setFormProjectId("");
    setFormLearningId("");
    setShowForm(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormDate(schedule.date);
    setFormTitle(schedule.title);
    setFormDescription(schedule.description || "");
    setFormProjectId(schedule.project_id || "");
    setFormLearningId(schedule.learning_content_id || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("일정을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        loadData();
        // Feed 페이지의 ScheduleCarousel에 변경사항 알림
        localStorage.setItem('schedule_updated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.error("[SchedulePage] 일정 삭제 실패:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/schedule/${editingId}` : "/api/schedule";
      const method = editingId ? "PUT" : "POST";

      const payload = {
        date: formDate,
        title: formTitle,
        description: formDescription || null,
        project_id: formProjectId && formProjectId.trim() ? formProjectId.trim() : null,
        learning_content_id: formLearningId && formLearningId.trim() ? formLearningId.trim() : null,
      };
      console.log("[SchedulePage] 일정 저장 요청:", { url, method, payload });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("[SchedulePage] 일정 저장 응답:", { status: res.status, data });

      if (res.ok && data.success) {
        setShowForm(false);
        loadData();
        // Feed 페이지의 ScheduleCarousel에 변경사항 알림
        localStorage.setItem('schedule_updated', Date.now().toString());
        // 같은 탭에서도 이벤트 발생시키기 위해 직접 dispatch
        window.dispatchEvent(new Event('storage'));
      } else {
        const errorMsg = data.error || data.detail || `일정 저장에 실패했습니다. (${res.status})`;
        alert(errorMsg);
        console.error("[SchedulePage] 일정 저장 실패:", { status: res.status, data });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.";
      alert(errorMsg);
      console.error("[SchedulePage] 일정 저장 실패:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">일정 관리</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-full shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            일정 추가
          </button>
        </div>
      </div>

      {/* 일정 목록 */}
      <div className="p-4 space-y-3">
        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Calendar className="w-14 h-14 mb-3 opacity-30" />
            <p className="text-sm">등록된 일정이 없습니다</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-sm text-blue-700 font-medium"
            >
              첫 일정 추가하기
            </button>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600">
                      {new Date(schedule.date).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </span>
                    {schedule.project_name && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        프로젝트: {schedule.project_name}
                      </span>
                    )}
                    {schedule.learning_title && (
                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        학습: {schedule.learning_title}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base mb-1">{schedule.title}</h3>
                  {schedule.description && (
                    <p className="text-sm text-gray-600 mb-2">{schedule.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 일정 추가/수정 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "일정 수정" : "일정 추가"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  날짜
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="일정 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명/코멘트
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="일정에 대한 설명이나 코멘트를 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로젝트 (선택사항)
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => {
                    setFormProjectId(e.target.value);
                    if (e.target.value) setFormLearningId(""); // 프로젝트 선택 시 학습 선택 해제
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">프로젝트 선택 안 함</option>
                  {projects.map((p) => (
                    <option key={p.project_id} value={p.project_id}>
                      {p.project_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학습 기록 (선택사항)
                </label>
                <select
                  value={formLearningId}
                  onChange={(e) => {
                    setFormLearningId(e.target.value);
                    if (e.target.value) setFormProjectId(""); // 학습 선택 시 프로젝트 선택 해제
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">학습 기록 선택 안 함</option>
                  {learningHistory.map((l) => (
                    <option key={l.id} value={l.content_id}>
                      {l.content_title || "제목 없음"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
