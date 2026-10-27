import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import BetaBanner from "@/components/BetaBanner";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ForSendersSection from "@/components/ForSendersSection";
import ForTravelersSection from "@/components/ForTravelersSection";
import ForBusinessSection from "@/components/ForBusinessSection";
import TrustSection from "@/components/TrustSection";
import MissionSection from "@/components/MissionSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ChatWidget from "@/components/ChatWidget";
import { LeadProvider } from "@/components/leads/LeadDialog";
import { track } from "@/lib/tracking";

const Index = () => {
  useEffect(() => track("page_view", "home"), []);
  return (
    <LeadProvider>
      <div className="min-h-screen bg-background pb-44 sm:pb-24">
        <Navbar />
        <BetaBanner />
        <HeroSection />
        <HowItWorksSection />
        <ForSendersSection />
        <ForTravelersSection />
        <ForBusinessSection />
        <TrustSection />
        <MissionSection />
        <FinalCTASection />
        <Footer />
        <BackToTop />
        <ChatWidget />
      </div>
    </LeadProvider>
  );
};

export default Index;
