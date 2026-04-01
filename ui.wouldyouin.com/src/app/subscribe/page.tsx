"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Zap, Crown, ArrowRight, X, Download, Image as ImageIcon } from "lucide-react";

export default function SubscribePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const plans = {
    monthly: {
      name: "월간",
      price: "9,900",
      period: "월",
      savings: null,
    },
    yearly: {
      name: "연간",
      price: "79,900",
      period: "년",
      savings: "20% 할인",
    },
  };

  const features = [
    {
      icon: Download,
      title: "무제한 다운로드",
      description: "프로젝트 코드와 이미지를 원하는 만큼 내려받으세요",
    },
    {
      icon: ImageIcon,
      title: "고품질 내보내기",
      description: "고해상도 이미지와 완전한 소스코드 제공",
    },
    {
      icon: Zap,
      title: "우선 지원",
      description: "새로운 기능을 가장 먼저 경험하세요",
    },
    {
      icon: Crown,
      title: "프리미엄 배지",
      description: "프로필에 프리미엄 배지가 표시됩니다",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">프리미엄 구독</h1>
          <div className="w-9" /> {/* 균형 맞추기 */}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* 메인 헤로 섹션 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
            <Star className="w-8 h-8 text-white" fill="white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프리미엄으로 업그레이드
          </h2>
          <p className="text-sm text-gray-600">
            코드와 이미지를 자유롭게 내려받고<br />
            더 많은 기능을 경험하세요
          </p>
        </div>

        {/* 요금제 선택 */}
        <div className="bg-white rounded-2xl p-1 mb-6 flex gap-1 shadow-sm">
          <button
            onClick={() => setSelectedPlan("monthly")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              selectedPlan === "monthly"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition relative ${
              selectedPlan === "yearly"
                ? "bg-blue-500 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            연간
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              20%
            </span>
          </button>
        </div>

        {/* 가격 카드 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6 text-white mb-6 shadow-xl">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold">{plans[selectedPlan].price}</span>
            <span className="text-lg text-white/80">원</span>
            <span className="text-sm text-white/70">/{plans[selectedPlan].period}</span>
          </div>
          {plans[selectedPlan].savings && (
            <p className="text-center text-sm text-white/90 mb-4">
              {plans[selectedPlan].savings}
            </p>
          )}
          <button
            onClick={() => {
              // TODO: 결제 연동
              alert("결제 기능은 준비 중입니다.");
            }}
            className="w-full py-4 bg-white text-blue-600 font-bold rounded-2xl text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-lg"
          >
            지금 시작하기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 기능 목록 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">포함된 기능</h3>
          <div className="space-y-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">
                      {feature.title}
                    </p>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                언제든지 취소할 수 있나요?
              </p>
              <p className="text-xs text-gray-600">
                네, 언제든지 구독을 취소할 수 있습니다. 취소 후에도 남은 기간 동안은 프리미엄 기능을 사용할 수 있습니다.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                결제는 어떻게 되나요?
              </p>
              <p className="text-xs text-gray-600">
                신용카드, 체크카드, 간편결제 등 다양한 결제 수단을 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
