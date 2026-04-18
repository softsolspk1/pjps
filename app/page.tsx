export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Hero from "@/components/Hero";
import ArticleCard from "@/components/ArticleCard";
import styles from "./page.module.css";
import { prisma } from "../lib/prisma";
import { 
  FileSearch, ShieldCheck, Globe, Zap, 
  Award, BookOpen, Microscope, Network,
  BarChart3, Hash
} from "lucide-react";

export default async function Home() {
  let LATEST_ARTICLES: any[] = [];
  
  try {
    const articlesData = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { authors: { orderBy: { sequence: 'asc' } } }
    });

    LATEST_ARTICLES = articlesData.map(a => ({
      category: "Published Article",
      title: a.title,
      authors: a.authors.map(author => author.name).join(", "),
      doi: "Pending",
      id: a.id,
      date: new Date(a.createdAt).toLocaleDateString()
    }));
  } catch (error) {
    console.error("Home page database fetch error:", error);
  }

  return (
    <div className={styles.home}>
      {/* Hero Section with Custom Background */}
      <section className={styles.premiumHero}>
        <div className={styles.heroOverlay} />
        <img src="/hero-pjps.png" alt="Scientific Research" className={styles.heroBgImage} />
        <div className={`${styles.heroContent} container`}>
          <div className={styles.badgeLine}>
            <span className={styles.premiumBadge}>
              <Award size={14} className="text-amber-400" /> HEC Platinum Category Journal
            </span>
            <span className={styles.premiumBadge}>
              <Globe size={14} className="text-blue-400" /> Scopus & Web of Science Indexed
            </span>
          </div>
          <h1 className={styles.mainTitle}>Pakistan Journal of <br/><span className="text-blue-500">Pharmaceutical Sciences</span></h1>
          <p className={styles.mainSubtitle}>
            A premier global platform for multidisciplinary pharmaceutical research since 1988. 
            Now transitioning to monthly publication from 2026.
          </p>
          <div className={styles.heroCta}>
            <Link href="/submission" className="btn btn-primary btn-lg shadow-xl hover:scale-105 transition-all">Submit Manuscript</Link>
            <Link href="/issues" className="btn btn-outline-white btn-lg backdrop-blur-md">Browse Current Issue</Link>
          </div>
          
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>0.6</span>
              <span className={styles.statLabel}>Impact Factor</span>
            </div>
            <div className={styles.statLine} />
            <div className={styles.statItem}>
              <span className={styles.statVal}>1.4</span>
              <span className={styles.statLabel}>Scopus CiteScore</span>
            </div>
            <div className={styles.statLine} />
            <div className={styles.statItem}>
              <span className={styles.statVal}>35+</span>
              <span className={styles.statLabel}>Years of Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scope & Excellence Section */}
      <section className="section-padding container">
        <div className={styles.gridSection}>
          <div className={styles.scopeText}>
            <span className={styles.preTitle}>Scientific Horizons</span>
            <h2 className={styles.titleSerif}>Comprehensive Academic Scope</h2>
            <p className={styles.bodyText}>
              PJPS unifies the expansive field of medicinal and pharmaceutical sciences, 
              focusing on breakthrough innovations and systematic reviews.
            </p>
            <div className={styles.topicCloud}>
              {[
                "Biological Sciences", "Drug Delivery", "Molecular Biology", 
                "Biopharmaceutics", "Pharmacology", "Natural Chemistry",
                "Nanotechnology", "Deep Learning in Pharma", "Generative AI", 
                "Drug-Target Interaction", "Genomic Pharmacognosy"
              ].map(topic => (
                <span key={topic} className={styles.topicTag}>{topic}</span>
              ))}
            </div>
          </div>
          <div className={styles.scopeCards}>
            <div className={styles.glassCard}>
              <ShieldCheck className="text-blue-600 mb-4" size={32} />
              <h4>Open Access Policy</h4>
              <p>Unrestricted global access under Creative Commons CC BY-NC-4.0 licensing. Authors retain full copyright.</p>
            </div>
            <div className={styles.glassCard}>
              <Zap className="text-amber-600 mb-4" size={32} />
              <h4>Rapid Dissemination</h4>
              <p>Transitioning to monthly frequency in 2026 to ensure the latest research reaches the community faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Indexing Section - High Fidelity */}
      <section className={`${styles.indexingSection} section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.preTitle}>Global Recognition</span>
            <h2 className={styles.sectionTitleCenter}>Abstracted & Indexed In</h2>
            <p className={styles.sectionSubtitleCenter}>Recognized by the world's most prestigious scientific databases and the HEC Pakistan.</p>
          </div>
          <div className={styles.indexingGridModern}>
            {[
              { name: "Scopus", img: "/scopus.png" },
              { name: "Web of Science", img: "/web1.png" },
              { name: "PubMed / MEDLINE", img: "/pubmed.png" },
              { name: "EMBASE", img: "/EMBASE.jpg" },
              { name: "DOAJ", img: "/DOAJ.png" },
              { name: "CABI", img: "/CABI.png" },
            ].map(index => (
              <div key={index.name} className={styles.indexModernItem}>
                <img src={index.img} alt={index.name} className={styles.indexLogoModern} />
                <span>{index.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Archive & Heritage */}
      <section className="section-padding container">
        <div className={styles.heritageGrid}>
          <div className={styles.archiveModernCard}>
            <div className={styles.cardHeader}>
               <BarChart3 className="text-blue-500" size={24} />
               <h3>Legacy of Research</h3>
            </div>
            <p>Access digitized volumes spanning from 1988 to the present day.</p>
            <div className={styles.dualArchiveBtn}>
              <Link href="/issues" className={styles.archiveBtnPrimary}>Current Issues (2020+)</Link>
              <Link href="/archive" className={styles.archiveBtnOutline}>Legacy Archive (1988-2019)</Link>
            </div>
          </div>

          <div className={styles.infoSummary}>
            <div className={styles.infoRow}>
              <Hash size={18} className="text-slate-400" />
              <div>
                <strong>ISSN (Print):</strong> 1011-601X
              </div>
            </div>
            <div className={styles.infoRow}>
              <Globe size={18} className="text-slate-400" />
              <div>
                <strong>ISSN (Online):</strong> 3105-9686
              </div>
            </div>
            <div className={styles.infoRow}>
               <Microscope size={18} className="text-slate-400" />
               <div>
                  <strong>Associated Journal:</strong> Pakistan Journal of Pharmacology
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journal Ethics & Publishing */}
      <section className={styles.ethicsSection}>
        <div className="container">
           <div className={styles.ethicsBox}>
              <div className={styles.ethicsIcon}>
                 <ShieldCheck size={48} className="text-emerald-500" />
              </div>
              <div className={styles.ethicsText}>
                 <h3>Publication Ethics & Licensing</h3>
                 <p>
                    All articles are licensed under the Creative Commons Attribution-Noncommercial 4.0 International License (CC BY-NC-4.0). 
                    PJPS adheres to COPE guidelines and ensures a rigorous double-blind peer review process.
                 </p>
                 <div className={styles.ethicsLinks}>
                    <Link href="/policy">Ethics Policy</Link>
                    <Link href="/instructions">Author Guidelines</Link>
                    <Link href="/contact">Editorial Office</Link>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

