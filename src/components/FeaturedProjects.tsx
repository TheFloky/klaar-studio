import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import type { Translations } from '@/lib/i18n';
import ventureImg from '@/assets/portfolio-venture.jpg.asset.json';
import jabeerImg from '@/assets/portfolio-jabeer.jpg.asset.json';
import stockImg from '@/assets/portfolio-stock.jpg.asset.json';

const images = [ventureImg.url, jabeerImg.url, stockImg.url];

export default function FeaturedProjects({ t }: { t: Translations }) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 sm:py-20 bg-secondary/30" aria-label="Portfolio and case studies">
      <div className="container">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-center text-foreground mb-4">
          {t.portfolio.title}
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          {t.portfolio.subtitle}
        </p>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {t.portfolio.projects.map((project, i) => (
            <a
              key={i}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden border-b border-border">
                <img
                  src={images[i]}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {project.client}
                </p>
                <h3 className="font-bold text-foreground text-lg flex items-center gap-1.5">
                  {project.title}
                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  />
                </h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2 flex-1">
                  {project.desc}
                </p>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {project.tags.map((tag, ti) => (
                    <Badge key={ti} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </a>
          ))}
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
