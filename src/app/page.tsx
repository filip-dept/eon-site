import Hero from '@/components/Hero/Hero';
import OnboardingModal from '@/components/Journey/OnboardingModal';

export default function Home() {
  return (
    <main>
      <Hero />
      {/* Hero chat chips open the 3-question onboarding → routes to /tariff */}
      <OnboardingModal />
    </main>
  );
}
