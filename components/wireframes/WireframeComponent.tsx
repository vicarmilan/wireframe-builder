import { PageComponent } from '@/types'
import NavigationWireframe from './NavigationWireframe'
import HeroWireframe from './HeroWireframe'
import FeaturesWireframe from './FeaturesWireframe'
import StatsWireframe from './StatsWireframe'
import TestimonialsWireframe from './TestimonialsWireframe'
import PricingWireframe from './PricingWireframe'
import CtaWireframe from './CtaWireframe'
import PortfolioWireframe from './PortfolioWireframe'
import TeamWireframe from './TeamWireframe'
import BlogWireframe from './BlogWireframe'
import FaqWireframe from './FaqWireframe'
import ContactWireframe from './ContactWireframe'
import FooterWireframe from './FooterWireframe'
import RestaurantWireframe from './RestaurantWireframe'
import HotelWireframe from './HotelWireframe'
import MarketplaceWireframe from './MarketplaceWireframe'

interface Props {
  component: PageComponent
  editing?: boolean
  onPropChange?: (key: string, value: string) => void
}

export default function WireframeComponent({ component, editing, onPropChange }: Props) {
  const p = component.props || {}
  const v = component.component_variant

  const commonProps = { props: p, variant: v, editing: !!editing, onPropChange: onPropChange || (() => {}) }

  switch (component.component_type) {
    case 'navigation': return <NavigationWireframe {...commonProps} />
    case 'hero': return <HeroWireframe {...commonProps} />
    case 'features': return <FeaturesWireframe {...commonProps} />
    case 'stats': return <StatsWireframe {...commonProps} />
    case 'testimonials': return <TestimonialsWireframe {...commonProps} />
    case 'pricing': return <PricingWireframe {...commonProps} />
    case 'cta': return <CtaWireframe {...commonProps} />
    case 'portfolio': return <PortfolioWireframe {...commonProps} />
    case 'team': return <TeamWireframe {...commonProps} />
    case 'blog': return <BlogWireframe {...commonProps} />
    case 'faq': return <FaqWireframe {...commonProps} />
    case 'contact': return <ContactWireframe {...commonProps} />
    case 'footer': return <FooterWireframe {...commonProps} />
    case 'restaurant': return <RestaurantWireframe {...commonProps} />
    case 'hotel': return <HotelWireframe {...commonProps} />
    case 'marketplace': return <MarketplaceWireframe {...commonProps} />
    default: return (
      <div className="bg-white px-8 py-6 text-sm text-gray-400 text-center">
        Onbekend component: {component.component_type}/{v}
      </div>
    )
  }
}
