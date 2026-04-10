import FormattingTool from "./FormattingTool";

export const metadata = {
  title: "Article Formatting Tool | PJPS Portal",
  description: "Professional scientific formatting tool for Pakistan Journal of Pharmaceutical Sciences submissions.",
};

export default function FormattingPage() {
  return (
    <div className="bg-white min-h-screen pb-20" style={{ paddingTop: '80px' }}>
      <div className="w-full px-4 sm:px-8">
        <div className="mb-10 mt-8 text-center max-w-3xl mx-auto">
          <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs block mb-3">Official PJPS Researcher Suite</span>
          <h1 className="text-5xl font-serif font-black text-slate-800 mb-4 tracking-tight">Manuscript Architect</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-normal">
            Transform your research into professional, publication-ready manuscripts 
            synchronized with PJPS world-class academic standards.
          </p>
        </div>
        
        <FormattingTool />
        
      </div>
    </div>
  );
}
