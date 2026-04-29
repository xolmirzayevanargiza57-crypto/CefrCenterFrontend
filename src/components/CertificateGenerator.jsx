import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function CertificateGenerator({ user, progress = {}, scores = {} }) {
  const certRef = useRef();
  const [generating, setGenerating] = useState(false);

  // Use the actual level from progress if available, else calculate
  const level = progress.level || "A1";
  const classificationMap = {
    "A1": "Elementary (Beginner)",
    "A2": "Pre-Intermediate (Waystage)",
    "B1": "Intermediate (Threshold)",
    "B2": "Upper-Intermediate (Vantage)",
    "C1": "Advanced (Effective Proficiency)",
    "C2": "Mastery (Proficiency)"
  };

  const band = level;
  const cefr = classificationMap[level] || "Language Learner";
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const downloadPDF = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CEFR_Certificate_${user?.email?.split('@')[0] || 'User'}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  return (
    <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Predicted Cefr Center Certificate</h3>
        <p style={{ color: '#8b9bbf', fontSize: 13 }}>Share your achievements with the world. Higher scores unlock better bands.</p>
      </div>

      {/* Hidden Certificate Template (A4 Landscape aspect ratio) */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={certRef} style={{
          width: '1122px', // A4 Landscape roughly
          height: '793px',
          background: '#ffffff',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          color: '#1a1a1a',
          position: 'relative',
          border: '20px solid #f8fafc',
        }}>
          {/* Decorative Border */}
          <div style={{ position: 'absolute', inset: '10px', border: '2px solid #e2e8f0' }} />
          
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <h1 style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-1px', color: '#0f172a', marginBottom: 10 }}>CERTIFICATE OF COMPLETION</h1>
            <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500, marginBottom: 40 }}>THIS IS TO CERTIFY THAT</p>
            
            <h2 style={{ fontSize: 42, fontWeight: 700, borderBottom: '2px solid #e2e8f0', minWidth: '400px', display: 'inline-block', paddingBottom: 10, color: '#3b82f6', marginBottom: 30 }}>
              {user?.email?.split('@')[0].toUpperCase() || 'VALUED STUDENT'}
            </h2>
            
            <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 40px' }}>
              has successfully fulfilled the linguistic requirements and demonstrated proficiency in the English language according to the Common European Framework of Reference for Languages (Cefr Center).
            </p>
            
            <div style={{ display: 'flex', gap: 60, marginBottom: 50 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Cefr Level</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{band}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Classification</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{cefr}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Issue Date</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{date}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Cefr Center</p>
                <p style={{ fontSize: 14, color: '#64748b' }}>Automated Assessment Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={downloadPDF}
          disabled={generating}
          style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
            color: '#fff', 
            border: 'none', 
            padding: '12px 28px', 
            borderRadius: 12, 
            fontSize: 15, 
            fontWeight: 700, 
            cursor: generating ? 'wait' : 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          {generating ? 'GENERATING...' : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF Certificate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
