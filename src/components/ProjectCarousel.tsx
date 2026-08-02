"use client";

import { useState } from "react";
import Image from "next/image";

interface Project {
  slug: string;
  title: string;
  image: string;
  description: string;
  link?: string;
}

function isPlaceholder(value?: string) {
  return !value || value.includes("PLATZHALTER");
}

export default function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0);
  const project = projects[index];

  const prev = () => setIndex((i) => (i - 1 + projects.length) % projects.length);
  const next = () => setIndex((i) => (i + 1) % projects.length);

  if (projects.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={prev}
          aria-label="Previous project"
          className="shrink-0 w-10 h-10 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ivory transition-colors"
        >
          ←
        </button>

        <div className="flex-1 rounded-xl border border-ink/10 bg-white/40 overflow-hidden">
          <div className="relative w-full h-64 sm:h-80 bg-ivory/40">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="600px"
              className="object-contain"
            />
          </div>
          <div className="p-5 text-center">
            <h3 className="text-lg mb-1">{project.title}</h3>
            <p className="text-sm text-ink/70">{project.description}</p>
            {!isPlaceholder(project.link) && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-rose hover:underline"
              >
                Learn more →
              </a>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="Next project"
          className="shrink-0 w-10 h-10 rounded-full border border-ink/20 flex items-center justify-center hover:bg-ivory transition-colors"
        >
          →
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to ${p.title}`}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === index ? "bg-rose" : "bg-ink/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
