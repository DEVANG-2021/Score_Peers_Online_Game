import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyDifferent } from "@/components/home/WhyDifferent";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Examples } from "@/components/home/Examples";
import { Rules } from "@/components/home/Rules";
import { ContestPreview } from "@/components/home/ContestPreview";
import { CTA } from "@/components/home/CTA";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/challenge");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header currentPage="home" />
      
      <main className="flex-1">
        <HeroSection onGetStarted={handleGetStarted} />
        <HowItWorks />
        <WhyDifferent />
        <Examples />
        <Rules />
        <ContestPreview />
        <CTA onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
