import Image from "next/image";
import { getAllCrewMembers, getPage } from "@/lib/content";

interface Settings {
  contactEmail: string;
}

export const metadata = {
  title: "Crew — The Ground Squirrel Café",
};

export default async function CrewPage() {
  const crew = await getAllCrewMembers();
  const settings = getPage<Settings>("settings");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-3xl sm:text-4xl text-center mb-4">Crew</h1>
      <p className="text-center text-ink/80 max-w-xl mx-auto mb-16">
        The people, the van, and the mascot behind the ground squirrel café.
      </p>

      <div className="flex flex-col gap-16">
        {crew.map((member, i) => (
          <div
            key={member.slug}
            className={`flex flex-col md:flex-row gap-8 items-center ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {member.photos && member.photos.length > 0 ? (
              <div className="flex flex-col gap-4 shrink-0 w-56 sm:w-64">
                {member.photos.map((photo) => (
                  <div
                    key={photo}
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-4 border-ivory shadow-sm"
                  >
                    <Image
                      src={photo}
                      alt={member.name}
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 shrink-0 rounded-full overflow-hidden border-4 border-ivory shadow-sm">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="256px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h2 className="text-2xl mb-1">{member.name}</h2>
              <p className="text-sm text-rose mb-4">{member.role}</p>
              <div
                className="prose prose-sm max-w-md mx-auto md:mx-0"
                dangerouslySetInnerHTML={{ __html: member.contentHtml }}
              />
              {(member.spiritAnimal || member.inspiredBy) && (
                <div className="mt-4 text-sm text-ink/70 space-y-1">
                  {member.spiritAnimal && (
                    <p>
                      <span className="text-ink/50">Spirit animal:</span> {member.spiritAnimal}
                    </p>
                  )}
                  {member.inspiredBy && (
                    <p>
                      <span className="text-ink/50">Inspired by:</span> {member.inspiredBy}
                    </p>
                  )}
                </div>
              )}
              {member.qualifications && member.qualifications.length > 0 && (
                <ul className="mt-3 text-xs text-ink/60 list-disc list-inside text-left inline-block">
                  {member.qualifications.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-2xl bg-lilac/30 border border-lilac px-6 py-10 text-center">
        <h2 className="text-2xl mb-3">Get in touch</h2>
        <p className="max-w-xl mx-auto mb-6 text-ink/80">
          Feeling inspired? Join us on our daily adventures and get a closer look at who we
          are and what we love. We&rsquo;re open to meaningful collaborations and would be
          delighted to connect with you!
        </p>
        <a
          href={`mailto:${settings.contactEmail}`}
          className="inline-block rounded-full bg-ink text-cream px-8 py-3 transition-colors hover:bg-rose hover:text-ink"
        >
          Say hello
        </a>
      </div>
    </div>
  );
}
