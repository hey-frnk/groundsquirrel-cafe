import { getPage, markdownToHtml } from "@/lib/content";

interface LegalPage {
  title: string;
}

export const metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz/" },
};

export default async function DatenschutzPage() {
  const page = getPage<LegalPage>("datenschutz");
  const html = await markdownToHtml(page.content);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-16 pb-20 sm:pt-24">
      <h1 className="border-b border-ink/10 pb-8 text-4xl sm:text-5xl">{page.title}</h1>
      <div
        className="prose mt-12 max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
