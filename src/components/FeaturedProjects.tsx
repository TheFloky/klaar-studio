import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { Translations } from '@/lib/i18n';
import jabeerwockyImg from '@/assets/portfolio-jabeerwocky.png';
import ckSolutionsImg from '@/assets/portfolio-ck-solutions.jpg';
import gearflowImg from '@/assets/portfolio-gearflow.jpg';

const images = [jabeerwockyImg, ckSolutionsImg, gearflowImg];

export default function FeaturedProjects({ t }: { t: Translations }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-secondary/30" aria-label="Portfolio and case studies">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.portfolio.title}
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          {t.portfolio.subtitle}
        </p>

        {/* Bento Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto auto-rows-[280px] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {t.portfolio.projects.map((project, i) => {
            // Large card for first, medium for second, small for third
            const sizeClass =
              i === 0
                ? 'md:col-span-2 md:row-span-2 auto-rows-[280px]'
                : '';

            return (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-xl bg-card border border-border cursor-pointer ${sizeClass}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Image */}
                <img
                  src={images[i]}
                  alt={project.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark gradient — always visible, concentrated at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Hover overlay — centered result + CTA */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-6 z-20">
                  <p className="text-white text-sm font-medium text-center">{project.result}</p>
                  <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    {t.portfolio.viewCase} <ArrowUpRight size={14} />
                  </Button>
                </div>

                {/* Content — sits on top of gradient */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 transition-opacity duration-300 group-hover:opacity-0">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {project.tags.map((tag, ti) => (
                      <Badge
                        key={ti}
                        variant="secondary"
                        className="bg-white/10 text-white border-white/20 text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">{project.client}</p>
                  <h3 className={`font-bold text-white ${i === 0 ? 'text-xl' : 'text-base'}`}>
                    {project.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">{project.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">{t.portfolio.ctaText}</p>
          <Button
            size="lg"
            className="swiss-red-glow px-8"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t.portfolio.ctaButton}
          </Button>
        </div>
      </div>
    </section>
  );
}
