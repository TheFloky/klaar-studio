import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComplianceChecker() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    navigate(`/audit?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <section id="compliance" className="py-20 sm:py-28 relative z-10">
      <div className="container max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Shield size={16} />
          Free Compliance Check
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
          Is Your Website Legally Compliant?
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Enter your website URL and we'll scan it for Swiss data protection issues — font leaks, US tracking scripts, hosting location, and more. Free, instant results.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourwebsite.ch"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-card text-foreground"
            />
          </div>
          <Button type="submit" size="lg" className="swiss-red-glow whitespace-nowrap">
            <Shield size={16} />
            Run Free Audit
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-4">
          Checks hosting location, Google Fonts, tracking scripts & Impressum — based on nFADP / nDSG requirements.
        </p>
      </div>
    </section>
  );
}
