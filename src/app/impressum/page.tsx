import { getPage, markdownToHtml } from "@/lib/content";

interface LegalPage {
  title: string;
}

export const metadata = {
  title: "Impressum — The Ground Squirrel Café",
};

export default async function ImpressumPage() {
  const page = getPage<LegalPage>("impressum");
  const html = await markdownToHtml(page.content);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl mb-8 text-center">{page.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
