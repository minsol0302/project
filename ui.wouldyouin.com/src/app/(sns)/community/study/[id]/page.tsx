import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import { getStudyDetail } from "../study-data";

type Props = {
  params: Promise<{ id: string }>;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-bold text-black">{title}</h2>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

export default async function StudyDetailPage({ params }: Props) {
  const { id } = await params;
  const study = getStudyDetail(id);
  if (!study) notFound();

  const external = study.applyUrl.startsWith("http");

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 min-h-[2rem]">
        <Link
          href="/community/study"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
        <a
          href={study.applyUrl}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center shrink-0 rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-50 transition-colors"
        >
          신청하기
        </a>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-base font-semibold text-black leading-snug">{study.name}</h1>
          <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
            {study.status}
          </span>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{study.day}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{study.location}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{study.members}</span>
            </div>
            <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              #{study.tag}
            </span>
          </div>
        </div>
      </div>

      <article className="space-y-8">
        <Section title="스터디 소개">{study.intro}</Section>
        <Section title="목표">{study.goals}</Section>
        <Section title="진행 방식">{study.howWeRun}</Section>
        <Section title="이런 분께 추천">{study.targetAudience}</Section>
        <Section title="유의사항">{study.notices}</Section>
      </article>
    </div>
  );
}
