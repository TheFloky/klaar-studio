import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Server, Scale, FileEdit, HeadsetIcon, Wrench, Cloud } from 'lucide-react';

const items = [
  {
    icon: Server,
    title: 'Hosting & Uptime Monitoring',
    desc: 'Your website is securely hosted and continuously monitored to ensure it stays online and performs reliably.',
  },
  {
    icon: Scale,
    title: 'Ongoing Legal Compliance (Swiss & EU)',
    desc: 'Your website is kept aligned with current data protection and legal standards, so you don\'t have to worry about regulations.',
  },
  {
    icon: FileEdit,
    title: 'Minor Content Updates',
    desc: 'Small changes such as text edits, images, or links are handled for you (up to 30 min – 2h per month depending on your plan).',
  },
  {
    icon: HeadsetIcon,
    title: 'Priority Support',
    desc: 'Fast, reliable assistance with a response time within 24 hours.',
  },
  {
    icon: Wrench,
    title: 'Bug Fixes & Maintenance',
    desc: 'Any technical issues are resolved to keep your website running smoothly.',
  },
  {
    icon: Cloud,
    title: 'Infrastructure & Service Costs Included',
    desc: 'Hosting, cloud storage, and required service usage are covered.',
  },
];

export default function Maintenance() {
  const { lang } = useParams<{ lang: string }>();
  const backPath = lang ? `/${lang}` : '/en';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-3xl py-16 sm:py-24 px-4">
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Homepage
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Maintenance & Support</h1>
        <p className="text-muted-foreground mb-12 max-w-xl">
          Every plan includes ongoing maintenance and support to keep your website secure, compliant, and running smoothly.
        </p>

        <div className="space-y-8">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <item.icon size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Have questions?{' '}
            <Link to={`${backPath}#contact`} className="text-primary hover:underline">
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
