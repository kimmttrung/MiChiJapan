

import Navbar from "../../components/Navbar";
import HeroSection from "../../components/HeroSection";
import ExplorationSection from "../../components/ExplorationSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-bg font-sans text-brand-dark">
      <Navbar />
      <HeroSection />
      <ExplorationSection />

      {/* Footer Placeholder (Để giao diện cân đối) */}
      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-200 mt-10">
        © 2025 MichiJapan. Thiết kế với tinh thần Omotenashi.
      </footer>
    </main>
  );
}