import Hero from '@/components/Hero/Hero';
import OnboardingModal from '@/components/Journey/OnboardingModal';
import IntroLoader from '@/components/IntroLoader/IntroLoader';

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Hero chat chips open the 3-question onboarding → routes to /tariff */}
      <OnboardingModal />
      {/* branded intro splash on first load */}
      <IntroLoader variant="home" />
    </main>
  );
}
