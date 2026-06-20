import Hero from '@/components/Hero/Hero';
import OnboardingJourney from '@/components/Journey/OnboardingJourney';
import IntroLoader from '@/components/IntroLoader/IntroLoader';

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Hero chat chips open the 3-question onboarding → routes to /tariff */}
      <OnboardingJourney />
      {/* branded intro splash on first load */}
      <IntroLoader variant="home" />
    </main>
  );
}
