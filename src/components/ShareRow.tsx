import {
  FacebookIcon,
  MailIcon,
  PinterestIcon,
  WhatsappIcon,
  XIcon,
} from "@/components/icons";
import { SITE_URL } from "@/lib/seo";

/**
 * The row that closes every journal post: five plain links, one per place a
 * story tends to get passed on to.
 *
 * They are ordinary hyperlinks with the address of the post in them - no
 * platform script, no button widget, no counter. Nothing reaches Facebook,
 * X, Pinterest or WhatsApp until a reader chooses to click, which is what keeps
 * this site free of consent banners; see the "Interactive maps" section of the
 * privacy policy for the same reasoning.
 */
export default function ShareRow({
  slug,
  title,
  excerpt,
  cover,
}: {
  slug: string;
  title: string;
  excerpt?: string;
  cover?: string;
}) {
  const url = `${SITE_URL}/journal/${slug}/`;
  const text = `${title} — The Ground Squirrel Café`;
  const e = encodeURIComponent;

  const targets = [
    {
      label: "Facebook",
      Icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    },
    {
      label: "X",
      Icon: XIcon,
      href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(title)}`,
    },
    {
      label: "Pinterest",
      Icon: PinterestIcon,
      // Pinterest pins a picture, so it is handed the post's cover photo.
      href: `https://pinterest.com/pin/create/button/?url=${e(url)}&description=${e(text)}${
        cover ? `&media=${e(`${SITE_URL}${cover}`)}` : ""
      }`,
    },
    {
      label: "WhatsApp",
      Icon: WhatsappIcon,
      href: `https://wa.me/?text=${e(`${text} ${url}`)}`,
    },
    {
      label: "Email",
      Icon: MailIcon,
      href: `mailto:?subject=${e(text)}&body=${e(`${excerpt ? `${excerpt}\n\n` : ""}${url}`)}`,
    },
  ];

  return (
    <div className="mt-14 border-t border-ink/10 pt-8 text-center">
      <p className="eyebrow">Pass it on</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        {targets.map(({ label, Icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${label}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-ivory/25 px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-graphite/75 transition-colors duration-200 hover:border-ink/30 hover:text-ink"
          >
            <Icon size={16} />
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
