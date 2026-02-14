import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhatIsSection from "@/components/WhatIsSection";
import PilotSection from "@/components/PilotSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import LocalDeliverySection from "@/components/LocalDeliverySection";
import GlobalDeliverySection from "@/components/GlobalDeliverySection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import TrustSection from "@/components/TrustSection";
import CourierSection from "@/components/CourierSection";
import PricingSection from "@/components/PricingSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <WhatIsSection />
      <PilotSection />
      <HowItWorksSection />
      <LocalDeliverySection />
      <GlobalDeliverySection />
      <WhyDifferentSection />
      <TrustSection />
      <CourierSection />
      <PricingSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
