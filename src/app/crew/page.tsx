import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { getAllCrewMembers, getPage } from "@/lib/content";
import { SITE_URL, evelynePerson, frankPerson } from "@/lib/seo";

interface Settings {
  contactEmail: string;
}

export const metadata = {
  // The full names carry the search weight — "Evelyne" alone matches nothing a
  // person would type when they are looking for her.
  title: { absolute: "Evelyne Buttet & Frank Zheng — the crew | The Ground Squirrel Café" },
  description:
    "Evelyne Buttet, illustrator and author, and Frank Zheng, engineer and barista, travel Europe in Humbär, a self-built 1992 VW LT camper, and run The Ground Squirrel Café.",
  alternates: { canonical: "/crew/" },
};

export default async function CrewPage() {
  const crew = await getAllCrewMembers();
  const settings = getPage<Settings>("settings");

  return (
    <div className="pb-4">
      {/* Both people as one graph, sharing the ids used elsewhere on the site,
          so the studio page, the journal by-lines and this page resolve to the
          same two entities rather than to look-alikes. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ProfilePage",
              "@id": `${SITE_URL}/crew/#page`,
              url: `${SITE_URL}/crew/`,
              name: "The crew behind The Ground Squirrel Café",
              about: [
                { "@id": `${SITE_URL}/studio/#evelyne-buttet` },
                { "@id": `${SITE_URL}/crew/#frank-zheng` },
              ],
              isPartOf: { "@id": `${SITE_URL}/#website` },
            },
            evelynePerson(),
            frankPerson(),
          ],
        }}
      />
      <header className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 sm:pt-24">
        <div className="border-b border-ink/10 pb-10">
          <p className="eyebrow">The Ground Squirrel Café</p>
          <h1 className="mt-5 text-5xl sm:text-7xl">Crew</h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {crew.map((member, i) => (
          <article
            key={member.slug}
            // Named, so a post can link straight to the person who wrote it.
            id={member.slug}
            className="reveal scroll-mt-24 grid items-start gap-10 border-b border-ink/10 py-16 sm:gap-14 sm:py-20 md:grid-cols-[20rem_1fr] md:gap-16"
          >
            <div>
              {member.photos && member.photos.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {member.photos.map((photo) => (
                    <div key={photo} className="overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={member.name}
                        loading="lazy"
                        className="block h-auto w-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-ink/10 bg-ivory/25">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 18rem"
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <p className="font-stamp text-[0.7rem] tracking-[0.2em] text-ink/45">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl">{member.name}</h2>
              <p className="mt-3 text-[0.7rem] uppercase tracking-[0.22em] text-graphite/65">
                {member.role}
              </p>
              <div
                className="prose prose-sm mt-7 max-w-xl"
                dangerouslySetInnerHTML={{ __html: member.contentHtml }}
              />

              {(member.spiritAnimal || member.inspiredBy) && (
                <dl className="mt-8 grid max-w-lg grid-cols-[7.5rem_1fr] gap-x-5 gap-y-3 border-t border-ink/10 pt-5 text-sm">
                  {member.spiritAnimal && (
                    <>
                      <dt className="pt-[0.2rem] text-[0.7rem] uppercase leading-relaxed tracking-[0.14em] text-graphite/60">
                        Spirit animal
                      </dt>
                      <dd className="leading-relaxed text-ink">{member.spiritAnimal}</dd>
                    </>
                  )}
                  {member.inspiredBy && (
                    <>
                      <dt className="pt-[0.2rem] text-[0.7rem] uppercase leading-relaxed tracking-[0.14em] text-graphite/60">
                        Inspired by
                      </dt>
                      <dd className="leading-relaxed text-ink">{member.inspiredBy}</dd>
                    </>
                  )}
                </dl>
              )}

              {member.qualifications && member.qualifications.length > 0 && (
                <ul className="mt-6 max-w-md space-y-1.5 text-xs leading-relaxed text-graphite/75">
                  {member.qualifications.map((q) => (
                    <li key={q} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-0.5 w-3 shrink-0 rounded-full bg-rose" />
                      {q}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>

      <section className="band-ivory mt-24 px-6 py-20 sm:mt-32 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Say hello</p>
          <h2 className="mt-6 text-3xl sm:text-[2.6rem]">Get in touch</h2>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-graphite">
            Feeling inspired? Join us on our daily adventures and get a closer look at who we
            are and what we love. We&rsquo;re open to meaningful collaborations and would be
            delighted to connect with you!
          </p>
          <a href={`mailto:${settings.contactEmail}`} className="btn btn-primary mt-10">
            Write to us
          </a>
        </div>
      </section>
    </div>
  );
}
