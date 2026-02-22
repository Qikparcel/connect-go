import Navbar from "@/components/Navbar";
import BetaBanner from "@/components/BetaBanner";
import HeroSection from "@/components/HeroSection";
import ForSendersSection from "@/components/ForSendersSection";
import ForTravelersSection from "@/components/ForTravelersSection";
import ForBusinessSection from "@/components/ForBusinessSection";
import TrustSection from "@/components/TrustSection";
import MissionSection from "@/components/MissionSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BetaBanner />
      <HeroSection />
      <ForSendersSection />
      <ForTravelersSection />
      <ForBusinessSection />
      <TrustSection />
      <MissionSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
};

export default Index;
