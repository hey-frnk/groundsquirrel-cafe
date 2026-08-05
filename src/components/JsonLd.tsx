/**
 * Renders a schema.org block. The site is a static export, so this is baked
 * into the HTML at build time and is there for the first crawler that asks.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The object is built from our own content files, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
