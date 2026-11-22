import NewHeader from '../components/NewHeader'
import NewHero from '../components/NewHero'
import FeatureSections from '../components/FeatureSections'
import FinalCTA from '../components/FinalCTA'
import NewFooter from '../components/NewFooter'

export default function Home() {
  return (
    <>
      <NewHeader />
      <main id="contenu" className="min-h-screen">
        <NewHero />
        <FeatureSections />
        <FinalCTA />
      </main>
      <NewFooter />
    </>
  )
}
