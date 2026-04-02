import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getJobDetail } from "../job-data";

type Props = {
  params: Promise<{ id: string }>;
};

function InfoRows({ rows, accentBlue }: { rows: { label: string; value: string; accent?: boolean }[]; accentBlue?: boolean }) {
  return (
    <div className="divide-y divide-gray-100">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-4 py-3 text-sm">
          <span className="w-24 shrink-0 text-gray-500">{row.label}</span>
          <span
            className={
              accentBlue && row.accent ? "text-blue-600 font-medium" : "text-gray-900"
            }
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function DocBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold text-black">
        <FileText className="w-5 h-5 text-gray-500 shrink-0" aria-hidden />
        {title}
      </h2>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line pl-0.5">{children}</div>
    </section>
  );
}

function EmojiSection({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-black">
        <span className="mr-1.5" aria-hidden>
          {emoji}
        </span>
        {title}
      </h2>
      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = getJobDetail(id);
  if (!job) notFound();

  const external = job.applyUrl.startsWith("http");

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-5 min-h-[2rem]">
        <Link
          href="/community/jobs"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
        <a
          href={job.applyUrl}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center justify-center shrink-0 rounded-full border border-black px-3 py-1.5 text-xs font-semibold text-black hover:bg-gray-50 transition-colors"
        >
          지원하기
        </a>
      </div>

      <header className="mb-6">
        <p className="text-sm text-gray-600">{job.company}</p>
        <h1 className="text-xl font-bold text-black mt-1 leading-snug">
          [{job.company}] {job.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs px-2 py-0.5 rounded-md border border-gray-200 text-gray-600">채용중</span>
          <span className="text-xs font-semibold text-red-500">{job.dday}</span>
          <span className="text-xs text-gray-500">
            {job.location} · {job.type}
          </span>
        </div>
      </header>

      <section className="mb-6">
        <InfoRows rows={job.primaryRows} accentBlue />
      </section>

      <hr className="border-gray-200 mb-6" />

      <section className="mb-10">
        <InfoRows rows={job.secondaryRows} />
      </section>

      <hr className="border-gray-200 mb-10" />

      <article className="space-y-10">
        <DocBlock title="주요업무">{job.mainTasks}</DocBlock>
        <DocBlock title="자격요건">{job.qualifications}</DocBlock>
        <DocBlock title="우대사항">{job.preferred}</DocBlock>
      </article>

      <hr className="border-gray-200 my-10" />

      <article className="space-y-10">
        <EmojiSection emoji="🏠" title="근무조건">
          {job.workConditionSection}
        </EmojiSection>
        <EmojiSection emoji="🎁" title="복지 및 혜택">
          {job.benefitsSection}
        </EmojiSection>
        <EmojiSection emoji="🚀" title="채용절차">
          {job.processSection}
        </EmojiSection>
        <EmojiSection emoji="⛑️" title="유의사항">
          {job.noticeSection}
        </EmojiSection>
      </article>
    </div>
  );
}
