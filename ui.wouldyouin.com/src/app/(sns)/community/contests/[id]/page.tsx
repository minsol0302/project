import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getContestDetail } from "../contest-data";

type Props = {
  params: Promise<{ id: string }>;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-black">[{title}]</h2>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

export default async function ContestDetailPage({ params }: Props) {
  const { id } = await params;
  const contest = getContestDetail(id);
  if (!contest) notFound();

  const external = contest.applyUrl.startsWith("http");

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4 min-h-[2rem]">
        <Link
          href="/community/contests"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
        <a
          href={contest.applyUrl}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center shrink-0 rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-50 transition-colors"
        >
          신청하기
        </a>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 mb-8">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">{contest.host}</p>
            <h1 className="text-lg font-semibold text-black leading-snug">{contest.title}</h1>
          </div>
          <span className="text-xs font-semibold text-red-500 shrink-0">{contest.dday}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarDays className="w-4 h-4" />
            <span>{contest.prize}</span>
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
            {contest.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <article className="space-y-10">
        <Section title="배경">{contest.background}</Section>
        <Section title="주제">{contest.topic}</Section>
        <Section title="설명">{contest.description}</Section>
      </article>
    </div>
  );
}
