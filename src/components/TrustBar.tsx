import { useScrollReveal } from '@/hooks/useScrollReveal';

const items = [
  'TWINT', 'PostFinance', 'Stripe', 'Shopify', 'WooCommerce', 'nDSG Compliant',
  'TWINT', 'PostFinance', 'Stripe', 'Shopify', 'WooCommerce', 'nDSG Compliant',
];

export default function TrustBar() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`py-10 overflow-hidden transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex animate-trust-scroll whitespace-nowrap">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 mx-8 sm:mx-12 text-muted-foreground/40 text-lg sm:text-xl font-bold tracking-widest uppercase select-none"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
