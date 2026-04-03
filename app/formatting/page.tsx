import FormattingTool from "./FormattingTool";

export const metadata = {
  title: "Article Formatting Tool | PJPS Portal",
  description: "Professional scientific formatting tool for Pakistan Journal of Pharmaceutical Sciences submissions.",
};

export default function FormattingPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="container">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs block mb-4">Researcher Tools</span>
            <h1 className="text-5xl font-serif font-black text-slate-900 mb-6 italic">Manuscript Architect</h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Format your research according to elite academic standards. Prepare your manuscript for 
              international peer review with our professional typesetting engine.
            </p>
          </div>
          
          <FormattingTool />
          
          <div className="mt-20 border-t border-slate-200 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border">
                <span className="font-serif font-black text-blue-600">P</span>
              </div>
              <div className="text-sm">
                <span className="block font-bold text-slate-900">Official PJPS Template</span>
                <span className="text-slate-500">Optimized for Elsevier/Web of Science</span>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="bg-white p-4 rounded-lg border shadow-sm text-center min-w-[120px]">
                 <span className="block text-2xl font-black text-slate-900 leading-none mb-1">100%</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Compliance</span>
               </div>
               <div className="bg-white p-4 rounded-lg border shadow-sm text-center min-w-[120px]">
                 <span className="block text-2xl font-black text-slate-900 leading-none mb-1">2-COL</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Scientific</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
