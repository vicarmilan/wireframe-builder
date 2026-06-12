import { ComponentDefinition, ComponentType } from '@/types'

export const COMPONENT_CATEGORIES: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'navigation', label: 'Navigatie', icon: 'Menu' },
  { type: 'hero', label: 'Hero', icon: 'Zap' },
  { type: 'features', label: 'Features', icon: 'Grid3x3' },
  { type: 'stats', label: 'Stats', icon: 'BarChart2' },
  { type: 'testimonials', label: 'Testimonials', icon: 'MessageSquare' },
  { type: 'pricing', label: 'Pricing', icon: 'Tag' },
  { type: 'cta', label: 'CTA', icon: 'MousePointer' },
  { type: 'portfolio', label: 'Portfolio', icon: 'Image' },
  { type: 'team', label: 'Team', icon: 'Users' },
  { type: 'blog', label: 'Blog', icon: 'BookOpen' },
  { type: 'faq', label: 'FAQ', icon: 'HelpCircle' },
  { type: 'contact', label: 'Contact', icon: 'Mail' },
  { type: 'footer', label: 'Footer', icon: 'AlignBottom' },
]

export const COMPONENTS: ComponentDefinition[] = [
  // Navigation
  {
    type: 'navigation',
    variant: 'simple',
    label: 'Eenvoudige nav',
    description: 'Logo links, links rechts, CTA knop',
    fields: [
      { key: 'logo', label: 'Logo tekst', type: 'text', placeholder: 'Bedrijfsnaam' },
      { key: 'cta', label: 'CTA knop', type: 'text', placeholder: 'Contact' },
    ],
  },
  {
    type: 'navigation',
    variant: 'centered',
    label: 'Gecentreerde nav',
    description: 'Logo boven, links gecentreerd',
    fields: [
      { key: 'logo', label: 'Logo tekst', type: 'text', placeholder: 'Bedrijfsnaam' },
    ],
  },
  {
    type: 'navigation',
    variant: 'mega',
    label: 'Mega menu nav',
    description: 'Nav met dropdown categorieën',
    fields: [
      { key: 'logo', label: 'Logo tekst', type: 'text', placeholder: 'Bedrijfsnaam' },
      { key: 'cta', label: 'CTA knop', type: 'text', placeholder: 'Gratis proberen' },
    ],
  },

  // Hero
  {
    type: 'hero',
    variant: 'centered',
    label: 'Gecentreerde hero',
    description: 'Titel, subtitel en knoppen gecentreerd',
    fields: [
      { key: 'eyebrow', label: 'Eyebrow tekst', type: 'text', placeholder: 'Nieuw' },
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'De beste oplossing voor jouw bedrijf' },
      { key: 'subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'Beschrijf hier kort wat je doet en welke waarde je biedt.' },
      { key: 'cta_primary', label: 'Primaire knop', type: 'text', placeholder: 'Aan de slag' },
      { key: 'cta_secondary', label: 'Secundaire knop', type: 'text', placeholder: 'Meer info' },
    ],
  },
  {
    type: 'hero',
    variant: 'split',
    label: 'Split hero',
    description: 'Tekst links, afbeelding rechts',
    fields: [
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'Jouw titel hier' },
      { key: 'subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'Korte beschrijving van je dienst of product.' },
      { key: 'cta_primary', label: 'Primaire knop', type: 'text', placeholder: 'Aan de slag' },
      { key: 'cta_secondary', label: 'Secundaire knop', type: 'text', placeholder: 'Demo bekijken' },
    ],
  },
  {
    type: 'hero',
    variant: 'video',
    label: 'Video hero',
    description: 'Hero met video placeholder achtergrond',
    fields: [
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'Indrukwekkende titel' },
      { key: 'cta_primary', label: 'Primaire knop', type: 'text', placeholder: 'Video bekijken' },
    ],
  },
  {
    type: 'hero',
    variant: 'minimal',
    label: 'Minimale hero',
    description: 'Grote typografie, geen afbeelding',
    fields: [
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'Wij maken geweldige websites' },
      { key: 'cta_primary', label: 'Knop', type: 'text', placeholder: 'Bekijk ons werk' },
    ],
  },

  // Features
  {
    type: 'features',
    variant: 'grid-3',
    label: 'Features 3-kolommen',
    description: '3 features met icoon, titel en tekst',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Waarom kiezen voor ons?' },
      { key: 'f1_title', label: 'Feature 1 titel', type: 'text', placeholder: 'Snel & betrouwbaar', group: 'Feature 1' },
      { key: 'f1_desc', label: 'Feature 1 tekst', type: 'textarea', placeholder: 'Korte omschrijving van deze feature.', group: 'Feature 1' },
      { key: 'f2_title', label: 'Feature 2 titel', type: 'text', placeholder: 'Eenvoudig te gebruiken', group: 'Feature 2' },
      { key: 'f2_desc', label: 'Feature 2 tekst', type: 'textarea', placeholder: 'Korte omschrijving van deze feature.', group: 'Feature 2' },
      { key: 'f3_title', label: 'Feature 3 titel', type: 'text', placeholder: 'Altijd beschikbaar', group: 'Feature 3' },
      { key: 'f3_desc', label: 'Feature 3 tekst', type: 'textarea', placeholder: 'Korte omschrijving van deze feature.', group: 'Feature 3' },
    ],
  },
  {
    type: 'features',
    variant: 'list-split',
    label: 'Features lijst split',
    description: 'Tekst links, feature lijst rechts',
    fields: [
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'Alles wat je nodig hebt' },
      { key: 'subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'Een korte beschrijving van je aanbod.' },
    ],
  },
  {
    type: 'features',
    variant: 'alternating',
    label: 'Afwisselende features',
    description: 'Features afwisselend links/rechts',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Hoe het werkt' },
      { key: 'f1_title', label: 'Stap 1 titel', type: 'text', placeholder: 'Stap 1', group: 'Stap 1' },
      { key: 'f1_desc', label: 'Stap 1 tekst', type: 'textarea', placeholder: 'Beschrijving van stap 1.', group: 'Stap 1' },
      { key: 'f2_title', label: 'Stap 2 titel', type: 'text', placeholder: 'Stap 2', group: 'Stap 2' },
      { key: 'f2_desc', label: 'Stap 2 tekst', type: 'textarea', placeholder: 'Beschrijving van stap 2.', group: 'Stap 2' },
    ],
  },

  // Stats
  {
    type: 'stats',
    variant: 'simple-4',
    label: '4 statistieken',
    description: 'Rij met 4 nummers en labels',
    fields: [
      { key: 's1_num', label: 'Stat 1 getal', type: 'text', placeholder: '10.000+', group: 'Stat 1' },
      { key: 's1_label', label: 'Stat 1 label', type: 'text', placeholder: 'Klanten', group: 'Stat 1' },
      { key: 's2_num', label: 'Stat 2 getal', type: 'text', placeholder: '99%', group: 'Stat 2' },
      { key: 's2_label', label: 'Stat 2 label', type: 'text', placeholder: 'Tevredenheid', group: 'Stat 2' },
      { key: 's3_num', label: 'Stat 3 getal', type: 'text', placeholder: '50+', group: 'Stat 3' },
      { key: 's3_label', label: 'Stat 3 label', type: 'text', placeholder: 'Landen', group: 'Stat 3' },
      { key: 's4_num', label: 'Stat 4 getal', type: 'text', placeholder: '24/7', group: 'Stat 4' },
      { key: 's4_label', label: 'Stat 4 label', type: 'text', placeholder: 'Support', group: 'Stat 4' },
    ],
  },

  // Testimonials
  {
    type: 'testimonials',
    variant: 'grid-3',
    label: 'Testimonials 3-kolommen',
    description: '3 reviews met avatar en naam',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Wat onze klanten zeggen' },
      { key: 't1_text', label: 'Review 1', type: 'textarea', placeholder: 'Super tevreden met de service!', group: 'Review 1' },
      { key: 't1_name', label: 'Naam 1', type: 'text', placeholder: 'Jan Janssen', group: 'Review 1' },
      { key: 't1_role', label: 'Functie 1', type: 'text', placeholder: 'CEO, Bedrijf X', group: 'Review 1' },
      { key: 't2_text', label: 'Review 2', type: 'textarea', placeholder: 'Aanrader voor iedereen.', group: 'Review 2' },
      { key: 't2_name', label: 'Naam 2', type: 'text', placeholder: 'Marie Pieters', group: 'Review 2' },
      { key: 't2_role', label: 'Functie 2', type: 'text', placeholder: 'Marketing Manager', group: 'Review 2' },
      { key: 't3_text', label: 'Review 3', type: 'textarea', placeholder: 'Uitstekende kwaliteit.', group: 'Review 3' },
      { key: 't3_name', label: 'Naam 3', type: 'text', placeholder: 'Tom Claes', group: 'Review 3' },
      { key: 't3_role', label: 'Functie 3', type: 'text', placeholder: 'Designer', group: 'Review 3' },
    ],
  },
  {
    type: 'testimonials',
    variant: 'featured',
    label: 'Featured testimonial',
    description: 'Grote enkele quote',
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', placeholder: 'Dit is de beste service die we ooit hebben gebruikt.' },
      { key: 'name', label: 'Naam', type: 'text', placeholder: 'Jan Janssen' },
      { key: 'role', label: 'Functie', type: 'text', placeholder: 'CEO, Bedrijf X' },
    ],
  },

  // Pricing
  {
    type: 'pricing',
    variant: 'three-tiers',
    label: '3 prijsplannen',
    description: 'Starter, Pro en Enterprise',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Eenvoudige prijzen' },
      { key: 'p1_name', label: 'Plan 1 naam', type: 'text', placeholder: 'Starter', group: 'Plan 1' },
      { key: 'p1_price', label: 'Plan 1 prijs', type: 'text', placeholder: '€29/maand', group: 'Plan 1' },
      { key: 'p2_name', label: 'Plan 2 naam', type: 'text', placeholder: 'Pro', group: 'Plan 2' },
      { key: 'p2_price', label: 'Plan 2 prijs', type: 'text', placeholder: '€79/maand', group: 'Plan 2' },
      { key: 'p3_name', label: 'Plan 3 naam', type: 'text', placeholder: 'Enterprise', group: 'Plan 3' },
      { key: 'p3_price', label: 'Plan 3 prijs', type: 'text', placeholder: 'Op aanvraag', group: 'Plan 3' },
    ],
  },

  // CTA
  {
    type: 'cta',
    variant: 'centered',
    label: 'Gecentreerde CTA',
    description: 'Titel, tekst en knoppen gecentreerd',
    fields: [
      { key: 'title', label: 'Titel', type: 'textarea', placeholder: 'Klaar om te beginnen?' },
      { key: 'subtitle', label: 'Subtitel', type: 'text', placeholder: 'Start vandaag gratis.' },
      { key: 'cta_primary', label: 'Primaire knop', type: 'text', placeholder: 'Gratis starten' },
      { key: 'cta_secondary', label: 'Secundaire knop', type: 'text', placeholder: 'Demo aanvragen' },
    ],
  },
  {
    type: 'cta',
    variant: 'banner',
    label: 'CTA banner',
    description: 'Volle breedte blauwe banner',
    fields: [
      { key: 'title', label: 'Titel', type: 'text', placeholder: 'Neem contact op' },
      { key: 'cta', label: 'Knop tekst', type: 'text', placeholder: 'Contact' },
    ],
  },

  // Portfolio
  {
    type: 'portfolio',
    variant: 'grid-3',
    label: 'Portfolio 3-kolommen',
    description: '3 projectkaarten met afbeelding',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Ons werk' },
      { key: 'p1_title', label: 'Project 1 titel', type: 'text', placeholder: 'Project naam', group: 'Project 1' },
      { key: 'p1_cat', label: 'Project 1 categorie', type: 'text', placeholder: 'Webdesign', group: 'Project 1' },
      { key: 'p2_title', label: 'Project 2 titel', type: 'text', placeholder: 'Project naam', group: 'Project 2' },
      { key: 'p2_cat', label: 'Project 2 categorie', type: 'text', placeholder: 'Branding', group: 'Project 2' },
      { key: 'p3_title', label: 'Project 3 titel', type: 'text', placeholder: 'Project naam', group: 'Project 3' },
      { key: 'p3_cat', label: 'Project 3 categorie', type: 'text', placeholder: 'Development', group: 'Project 3' },
    ],
  },

  // Team
  {
    type: 'team',
    variant: 'grid',
    label: 'Team grid',
    description: 'Teamleden met foto, naam en functie',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Ons team' },
      { key: 'm1_name', label: 'Lid 1 naam', type: 'text', placeholder: 'Jan Janssen', group: 'Lid 1' },
      { key: 'm1_role', label: 'Lid 1 functie', type: 'text', placeholder: 'CEO & Founder', group: 'Lid 1' },
      { key: 'm2_name', label: 'Lid 2 naam', type: 'text', placeholder: 'Marie Pieters', group: 'Lid 2' },
      { key: 'm2_role', label: 'Lid 2 functie', type: 'text', placeholder: 'Designer', group: 'Lid 2' },
      { key: 'm3_name', label: 'Lid 3 naam', type: 'text', placeholder: 'Tom Claes', group: 'Lid 3' },
      { key: 'm3_role', label: 'Lid 3 functie', type: 'text', placeholder: 'Developer', group: 'Lid 3' },
    ],
  },

  // Blog
  {
    type: 'blog',
    variant: 'grid-3',
    label: 'Blog 3-kolommen',
    description: '3 blogartikel kaarten',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Laatste artikelen' },
      { key: 'a1_title', label: 'Artikel 1 titel', type: 'text', placeholder: 'Hoe je een website bouwt', group: 'Artikel 1' },
      { key: 'a1_date', label: 'Artikel 1 datum', type: 'text', placeholder: '12 juni 2025', group: 'Artikel 1' },
      { key: 'a2_title', label: 'Artikel 2 titel', type: 'text', placeholder: 'Tips voor betere UX', group: 'Artikel 2' },
      { key: 'a2_date', label: 'Artikel 2 datum', type: 'text', placeholder: '5 juni 2025', group: 'Artikel 2' },
      { key: 'a3_title', label: 'Artikel 3 titel', type: 'text', placeholder: 'Design trends 2025', group: 'Artikel 3' },
      { key: 'a3_date', label: 'Artikel 3 datum', type: 'text', placeholder: '1 juni 2025', group: 'Artikel 3' },
    ],
  },

  // FAQ
  {
    type: 'faq',
    variant: 'accordion',
    label: 'FAQ accordion',
    description: 'Veelgestelde vragen uitklapbaar',
    fields: [
      { key: 'title', label: 'Sectietitel', type: 'text', placeholder: 'Veelgestelde vragen' },
      { key: 'q1', label: 'Vraag 1', type: 'text', placeholder: 'Hoe werkt het?', group: 'Vraag 1' },
      { key: 'a1', label: 'Antwoord 1', type: 'textarea', placeholder: 'Het werkt eenvoudig door...', group: 'Vraag 1' },
      { key: 'q2', label: 'Vraag 2', type: 'text', placeholder: 'Wat zijn de kosten?', group: 'Vraag 2' },
      { key: 'a2', label: 'Antwoord 2', type: 'textarea', placeholder: 'De kosten zijn afhankelijk van...', group: 'Vraag 2' },
      { key: 'q3', label: 'Vraag 3', type: 'text', placeholder: 'Kan ik gratis proberen?', group: 'Vraag 3' },
      { key: 'a3', label: 'Antwoord 3', type: 'textarea', placeholder: 'Ja, je kan 14 dagen gratis proberen.', group: 'Vraag 3' },
    ],
  },

  // Contact
  {
    type: 'contact',
    variant: 'split',
    label: 'Contact split',
    description: 'Info links, formulier rechts',
    fields: [
      { key: 'title', label: 'Titel', type: 'text', placeholder: 'Neem contact op' },
      { key: 'subtitle', label: 'Subtitel', type: 'textarea', placeholder: 'We horen graag van je.' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'info@bedrijf.be' },
      { key: 'phone', label: 'Telefoon', type: 'text', placeholder: '+32 000 00 00 00' },
      { key: 'address', label: 'Adres', type: 'text', placeholder: 'Brussel, België' },
    ],
  },
  {
    type: 'contact',
    variant: 'centered',
    label: 'Gecentreerd contactformulier',
    description: 'Formulier gecentreerd op pagina',
    fields: [
      { key: 'title', label: 'Titel', type: 'text', placeholder: 'Stuur een bericht' },
      { key: 'cta', label: 'Knop tekst', type: 'text', placeholder: 'Versturen' },
    ],
  },

  // Footer
  {
    type: 'footer',
    variant: 'simple',
    label: 'Eenvoudige footer',
    description: 'Logo, links en copyright',
    fields: [
      { key: 'logo', label: 'Logo tekst', type: 'text', placeholder: 'Bedrijfsnaam' },
      { key: 'copyright', label: 'Copyright', type: 'text', placeholder: '© 2025 Bedrijfsnaam. Alle rechten voorbehouden.' },
    ],
  },
  {
    type: 'footer',
    variant: 'multi-column',
    label: 'Multi-kolom footer',
    description: 'Logo, 4 kolommen met links',
    fields: [
      { key: 'logo', label: 'Logo tekst', type: 'text', placeholder: 'Bedrijfsnaam' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Jouw omschrijving hier' },
      { key: 'copyright', label: 'Copyright', type: 'text', placeholder: '© 2025 Bedrijfsnaam.' },
    ],
  },
]

export function getComponentDef(type: string, variant: string): ComponentDefinition | undefined {
  return COMPONENTS.find((c) => c.type === type && c.variant === variant)
}

export function getComponentsByType(type: ComponentType): ComponentDefinition[] {
  return COMPONENTS.filter((c) => c.type === type)
}
