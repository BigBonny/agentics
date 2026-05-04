import NewHeader from '../components/NewHeader'
import NewHero from '../components/NewHero'
import PremiumFeatures from '../components/PremiumFeatures'
import SocialProof from '../components/SocialProof'
import FinalCTA from '../components/FinalCTA'
import NewFooter from '../components/NewFooter'

export default function Home() {
  return (
    <main className="min-h-screen">
      <NewHeader />
      <NewHero />
      <PremiumFeatures />
      <SocialProof />
      <FinalCTA />
      <NewFooter />
    </main>
  )
}
