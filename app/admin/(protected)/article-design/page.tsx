import ArticleDesignTool from "./ArticleDesignTool";
import { 
  Palette, 
  HelpCircle, 
  Info,
  Sparkles
} from "lucide-react";

export default function ArticleDesignPage() {
  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0061ff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
            <Palette size={14} /> Scholarly Typesetting Engine
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1a202c', fontFamily: 'var(--font-serif)' }}>Article Design Studio</h1>
          <p style={{ color: '#718096', fontWeight: 600, fontSize: '15px', marginTop: '4px' }}>New Advanced Manuscript Architect for Professional Layouts</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #edf2f7', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Sparkles size={18} color="#0061ff" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1a202c' }}>V2.0 Engine Active</span>
            </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '24px', border: '1px solid #edf2f7', padding: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <ArticleDesignTool />
          </div>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#1a202c', color: 'white', padding: '30px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                    <Palette size={120} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '15px', position: 'relative' }}>Pro Tips</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ fontSize: '13px', color: '#a0aec0', display: 'flex', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#0061ff', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                        Use the Columns icon to insert a two-column layout for the body.
                    </li>
                    <li style={{ fontSize: '13px', color: '#a0aec0', display: 'flex', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#0061ff', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                        Paste images directly to upload them to Cloudinary.
                    </li>
                    <li style={{ fontSize: '13px', color: '#a0aec0', display: 'flex', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: '#0061ff', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                        Print to PDF to generate the final manuscript for publication.
                    </li>
                </ul>
            </div>

            <div style={{ backgroundColor: 'white', border: '1px solid #edf2f7', padding: '25px', borderRadius: '24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <HelpCircle size={18} color="#0061ff" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1a202c' }}>Layout Guidelines</h3>
               </div>
               <p style={{ fontSize: '13px', color: '#4a5568', lineHeight: 1.6 }}>
                 Ensure all sections follow the PJPS standards. Use Header 1 for the main title and Header 2 for sections like Abstract, Introduction, and Results.
               </p>
               <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f7fafc', borderRadius: '12px', display: 'flex', gap: '10px' }}>
                  <Info size={16} color="#718096" />
                  <p style={{ fontSize: '11px', color: '#718096', fontWeight: 600 }}>
                    Abstracts should always be full-width at the top of the manuscript.
                  </p>
               </div>
            </div>
          </aside>
      </div>
    </div>
  );
}
