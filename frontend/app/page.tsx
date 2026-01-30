import AIPlanner from "../src/components/AIPlanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="h-[400px] bg-blue-900 flex items-center justify-center text-white">
        <h1 className="text-4xl font-bold">Khám phá Việt Nam cùng AI</h1>
      </div>

      {/* AI Component */}
      <AIPlanner />

      {/* Section khác */}
      <div className="max-w-6xl mx-auto mt-20 p-6">
        <h2 className="text-2xl font-bold mb-6">Điểm đến nổi bật</h2>
        {/* Render các Card ở đây */}
      </div>
    </main>
  );
}