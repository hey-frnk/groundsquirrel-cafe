import Image from "next/image";

/**
 * The studio's painted wordmark. It carries the studio's name, so it is the
 * page's <h1> with the logo standing in for the text — a screen reader and a
 * search engine both still read "the ground squirrel studio".
 */
export default function StudioWordmark({ className = "" }: { className?: string }) {
  return (
    <h1 className={className}>
      <Image
        src="/images/studio/brand/studio-wordmark.webp"
        alt="the ground squirrel studio"
        width={1000}
        height={283}
        priority
        className="w-full h-auto"
      />
    </h1>
  );
}
