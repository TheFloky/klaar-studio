-- DE: question-form title + clean tags + tightened meta
UPDATE public.blog_posts
SET
  title = 'Brauche ich für meine Schweizer Website ein Impressum?',
  seo_title = 'Schweizer Website: Impressum, Datenschutz & Cookies',
  seo_description = 'Welche rechtlichen Dokumente braucht Ihre Schweizer Website wirklich? Impressum, Datenschutz, Cookies — verständlich erklärt.',
  excerpt = 'Brauchen Sie ein Impressum, eine Datenschutzerklärung oder einen Cookie-Banner? Dieser Guide erklärt die Schweizer Pflichten verständlich.',
  tags = ARRAY['nDSG', 'Datenschutz', 'Website-Compliance', 'Impressum', 'Privacy Policy', 'Cookie Banner', 'Schweizer Recht']
WHERE slug = 'website-compliance-schweiz-ndsg-anleitung' AND lang = 'de';

-- FR: question-form title + translated clean tags + tightened meta
UPDATE public.blog_posts
SET
  title = 'Mon site web suisse doit-il avoir des mentions légales ?',
  seo_title = 'Site web suisse : mentions légales, LPD et cookies',
  seo_description = 'Quels documents légaux votre site web suisse doit-il afficher ? Mentions légales, LPD, cookies — le guide clair.',
  excerpt = 'Mentions légales, politique de confidentialité, gestion des cookies : ce guide explique ce que la loi suisse exige vraiment.',
  tags = ARRAY['LPD', 'Confidentialité', 'Conformité web', 'Mentions légales', 'Politique de confidentialité', 'Cookies', 'Droit suisse']
WHERE slug = 'website-compliance-schweiz-ndsg-anleitung' AND lang = 'fr';

-- EN: question-form title + translated clean tags + tightened meta
UPDATE public.blog_posts
SET
  title = 'Do I need a legal notice on my Swiss website?',
  seo_title = 'Swiss Website Compliance: Legal Notice & Cookies',
  seo_description = 'Which legal documents does your Swiss website really need? Legal notice, FADP privacy, cookies — explained clearly.',
  excerpt = 'Legal notice, privacy policy, cookie consent: this guide explains what Swiss law actually requires for your website.',
  tags = ARRAY['FADP', 'Privacy', 'Web compliance', 'Legal notice', 'Privacy policy', 'Cookies', 'Swiss law']
WHERE slug = 'website-compliance-schweiz-ndsg-anleitung' AND lang = 'en';