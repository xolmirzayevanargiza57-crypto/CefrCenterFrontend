import React, { useState, useEffect, useCallback } from 'react';
import {
  Utensils, Pizza, Cherry, Palette, GraduationCap, Dog,
  HandMetal, BookOpen, CloudSun, Users, Hash, Brain,
  Search, ChevronRight, Info, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

// ── Backend URL ──────────────────────────────────────────────────────────────
import BACKEND_URL from "./config/api.js";

// ── Fallback static data (backend ishlamasa ishlatiladi) ──────────────────────
const FALLBACK_DATA = [
  {
    id: 'greetings-uz-en',
    category: 'greetings',
    categoryLabel: 'Salomlashish',
    fromLangLabel: 'Inglizcha',
    toLangLabel: "O'zbekcha",
    words: [
      { word: 'Hello',      translation: 'Salom',         sentences: ['Hello, how are you?', 'Hello! Nice to meet you.'] },
      { word: 'Goodbye',    translation: 'Xayr',          sentences: ['Goodbye, see you tomorrow!'] },
      { word: 'Thank you',  translation: 'Rahmat',        sentences: ['Thank you for your help.'] },
      { word: 'Please',     translation: 'Iltimos',       sentences: ['Please help me.', 'Please be quiet.'] },
      { word: 'Sorry',      translation: 'Kechirasiz',     sentences: ["Sorry, I didn't mean it."] },
      { word: 'Yes',        translation: 'Ha',            sentences: ['Yes, I understand.'] },
      { word: 'No',         translation: 'Yo\'q',         sentences: ["No, thank you."] },
      { word: 'Good morning', translation: 'Xayrli tong',   sentences: ['Good morning! How did you sleep?'] },
    ],
  },
  {
    id: 'animals-uz-en',
    category: 'animals',
    categoryLabel: 'Hayvonlar',
    fromLangLabel: 'Inglizcha',
    toLangLabel: "O'zbekcha",
    words: [
      { word: 'Dog',    translation: 'Kuchuk',    sentences: ['The dog is barking loudly.'] },
      { word: 'Cat',    translation: 'Mushuk',    sentences: ['The cat is sleeping on the sofa.'] },
      { word: 'Bird',   translation: 'Qush',      sentences: ['A bird is singing in the tree.'] },
      { word: 'Fish',   translation: 'Baliq',     sentences: ['Fish live in water.'] },
      { word: 'Horse',  translation: 'Ot',        sentences: ['The horse runs very fast.'] },
      { word: 'Cow',    translation: 'Sigir',     sentences: ['The cow gives us milk.'] },
    ],
  },
  {
    id: 'colors-uz-en',
    category: 'colors',
    categoryLabel: 'Ranglar',
    fromLangLabel: 'Inglizcha',
    toLangLabel: "O'zbekcha",
    words: [
      { word: 'Red',    translation: 'Qizil',    sentences: ['The apple is red.', 'She wore a red dress.'] },
      { word: 'Blue',   translation: 'Ko\'k',     sentences: ['The sky is blue today.'] },
      { word: 'Green',  translation: 'Yashil',   sentences: ['The grass is green.', 'I like green tea.'] },
      { word: 'Yellow', translation: 'Sariq',    sentences: ['The sun is yellow.'] },
      { word: 'White',  translation: 'Oq',       sentences: ['Snow is white.'] },
      { word: 'Black',  translation: 'Qora',     sentences: ['The night is black.'] },
    ],
  },
  {
    id: 'numbers-uz-en',
    category: 'numbers',
    categoryLabel: 'Sonlar',
    fromLangLabel: 'Inglizcha',
    toLangLabel: "O'zbekcha",
    words: [
      { word: 'One',   translation: 'Bir',   sentences: ['I have one brother.'] },
      { word: 'Two',   translation: 'Ikki',  sentences: ['There are two cats.'] },
      { word: 'Three', translation: 'Uch',   sentences: ['She bought three apples.'] },
      { word: 'Four',  translation: 'To\'rt', sentences: ['There are four seasons.'] },
      { word: 'Five',  translation: 'Besh',  sentences: ['I woke up at five.'] },
      { word: 'Ten',   translation: 'O\'n',   sentences: ['He is ten years old.'] },
    ],
  },
];

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORY_META = {
  kitchen:    { icon: Utensils,      accent: '#38bdf8', bg: 'rgba(56,189,248,0.10)'  },
  food:       { icon: Pizza,         accent: '#fb923c', bg: 'rgba(251,146,60,0.10)'  },
  fruits:     { icon: Cherry,        accent: '#4ade80', bg: 'rgba(74,222,128,0.10)'  },
  vegetables: { icon: Pizza,         accent: '#22c55e', bg: 'rgba(34,197,94,0.10)'   },
  colors:     { icon: Palette,       accent: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
  school:     { icon: GraduationCap, accent: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  animals:    { icon: Dog,           accent: '#fbbf24', bg: 'rgba(251,191,36,0.10)'  },
  greetings:  { icon: HandMetal,     accent: '#34d399', bg: 'rgba(52,211,153,0.10)'  },
  body:       { icon: Brain,         accent: '#f87171', bg: 'rgba(248,113,113,0.10)' },
  weather:    { icon: CloudSun,      accent: '#60a5fa', bg: 'rgba(96,165,250,0.10)'  },
  family:     { icon: Users,         accent: '#c084fc', bg: 'rgba(192,132,252,0.10)' },
  numbers:    { icon: Hash,          accent: '#facc15', bg: 'rgba(250,204,21,0.10)'  },
  default:    { icon: BookOpen,      accent: '#60a5fa', bg: 'rgba(96,165,250,0.10)'  },
};

function getCategoryMeta(category) {
  return CATEGORY_META[category?.toLowerCase()] || CATEGORY_META.default;
}

// ── Word Card with Edit/Delete ────────────────────────────────────────────────
function Flashcard({ item, accent, accentBg, isCustom, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const sentences = item.sentences || [];

  const handleNextSentence = (e) => {
    e.stopPropagation();
    setSentenceIdx((prev) => (prev + 1) % sentences.length);
  };

  return (
    <div
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: '1200px', cursor: 'pointer', height: 260, position: 'relative' }}
    >
      {isCustom && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, display: 'flex', gap: 6 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.word); }}
            style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(225,29,72,0.15)', border: 'none', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
             ×
          </button>
        </div>
      )}
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* FRONT */}
        <div style={{
          ...cardFace,
          background: 'linear-gradient(145deg, #16213e 0%, #0d1b2e 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: accentBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, color: accent,
          }}>
            <BookOpen size={36} />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#eef4ff', margin: 0, letterSpacing: -0.4, textAlign: 'center' }}>
            {item.word}
          </h3>
          <span style={{ fontSize: 10, color: '#475569', letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: 700, marginTop: 6 }}>
            tap to flip
          </span>
        </div>

        {/* BACK */}
        <div style={{
          ...cardFace,
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(145deg, #0d1b2e 0%, #111827 100%)',
          border: `1px solid ${accent}33`,
        }}>
          <div style={{ color: accent, marginBottom: 8 }}><Info size={28} /></div>
          <span style={{ fontSize: 9, color: accent, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>
            Translation
          </span>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#eef4ff', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>
            {item.translation}
          </h3>
          {sentences.length > 0 && (
            <div style={{ marginTop: 12, width: '100%', textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.55, margin: 0, fontStyle: 'italic', padding: '0 8px' }}>
                "{sentences[sentenceIdx]}"
              </p>
              {sentences.length > 1 && (
                <button
                  onClick={handleNextSentence}
                  style={{
                    marginTop: 8, background: accentBg, border: 'none',
                    borderRadius: 8, color: accent, fontSize: 10, fontWeight: 700,
                    padding: '5px 14px', cursor: 'pointer', letterSpacing: 0.5,
                  }}
                >
                  Next Example <ChevronRight size={10} style={{ display: 'inline', marginLeft: 2 }} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardFace = {
  position: 'absolute', inset: 0,
  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  borderRadius: 20, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  padding: '18px 16px', boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
};

// ── Tab Button ────────────────────────────────────────────────────────────────
function SetTab({ set, isActive, onClick }) {
  const meta = getCategoryMeta(set.category);
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 14,
        border: isActive ? `1.5px solid ${meta.accent}66` : '1px solid rgba(255,255,255,0.06)',
        background: isActive ? meta.bg : '#111827',
        color: isActive ? meta.accent : '#64748b',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
        transition: 'all .2s cubic-bezier(0.4,0,0.2,1)',
        letterSpacing: 0.3, whiteSpace: 'nowrap', fontFamily: 'inherit',
      }}
    >
      <Icon size={16} />
      {set.categoryLabel}
    </button>
  );
}

export default function Vocabulary({ progress, saveVocabulary, updateProfileData }) {
  const [allSets, setAllSets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [search, setSearch]             = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', translation: '', meaning: '', sentence: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/vocabulary`);
      if (!res.ok) throw new Error('Backend failed');
      const data = await res.json();
      
      const customSet = {
        id: 'personal',
        category: 'school',
        categoryLabel: 'Personal Words',
        fromLangLabel: 'Word',
        toLangLabel: 'Meaning',
        words: (progress.vocabulary || []).map(v => ({ ...v, translation: v.definition })),
        isCustom: true
      };

      setAllSets([customSet, ...data]);
      setSelectedSetId(customSet.words.length > 0 ? 'personal' : data[0]?.id);
    } catch (err) {
      const customSet = {
        id: 'personal',
        category: 'school',
        categoryLabel: 'Personal Words',
        fromLangLabel: 'Word',
        toLangLabel: 'Meaning',
        words: (progress.vocabulary || []).map(v => ({ ...v, translation: v.definition })),
        isCustom: true
      };
      setUsingFallback(true);
      setAllSets([customSet, ...FALLBACK_DATA]);
      setSelectedSetId('personal');
    } finally {
      setLoading(false);
    }
  }, [progress.vocabulary]);

  const handleAddWord = (e) => {
    e.preventDefault();
    saveVocabulary(newWord.word, newWord.meaning || newWord.translation, newWord.sentence);
    setShowAddModal(false);
    setNewWord({ word: '', translation: '', meaning: '', sentence: '' });
  };

  const deleteWord = (word) => {
    if (!window.confirm(`Delete "${word}"?`)) return;
    const next = (progress.vocabulary || []).filter(v => v.word !== word);
    updateProfileData({ vocabulary: next });
  };

  useEffect(() => { loadData(); }, [loadData]);

  // ── Loading ──
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: '#475569', marginTop: 14, fontSize: 13, letterSpacing: 0.3 }}>
          Loading words...
        </p>
      </div>
    );
  }

  const currentSet = allSets.find((s) => s.id === selectedSetId) || allSets[0];
  const meta = getCategoryMeta(currentSet?.category);

  const filteredWords = currentSet
    ? currentSet.words.filter(
        (w) =>
          w.word.toLowerCase().includes(search.toLowerCase()) ||
          w.translation.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* ── Fallback banner ── */}
      {usingFallback && (
        <div style={styles.banner}>
          <WifiOff size={14} style={{ flexShrink: 0 }} />
          <span>
            Backend not connected — showing demo data.{' '}
            <button onClick={loadData} style={styles.retryBtn}>
              <RefreshCw size={11} /> Try Again
            </button>
          </span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: meta.accent }}><BookOpen size={32} /></div>
          <div>
            <h2 style={{ ...styles.title, color: '#eef4ff' }}>Vocabulary Hub</h2>
            {currentSet && (
              <p style={styles.subtitle}>
                {currentSet.fromLangLabel} <span style={{ margin: '0 8px', color: meta.accent }}>→</span> {currentSet.toLangLabel}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setNewWord({ word: '', translation: '', meaning: '', sentence: '' }); setShowAddModal(true); }} style={{ 
            background: '#4a9eff', color: '#fff', border: 'none', 
            padding: '10px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(74,158,255,0.3)', transition: 'transform 0.1s',
            fontFamily: 'inherit'
          }} onMouseDown={e => e.currentTarget.style.transform='scale(0.96)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
            + Add Word
          </button>

          {/* Search */}
          <div style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} color="#475569" />
            <input
              style={styles.searchInput}
              placeholder="Search words..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ ...styles.clearBtn }}
                title="Clear"
              >×</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabs}>
        {allSets.map((set) => (
          <SetTab
            key={set.id}
            set={set}
            isActive={set.id === selectedSetId}
            onClick={() => { setSelectedSetId(set.id); setSearch(''); }}
          />
        ))}
      </div>

      {/* ── Stats bar ── */}
      {currentSet && (
        <div style={styles.statsBar}>
          <span style={{ ...styles.badge, color: meta.accent, borderColor: `${meta.accent}30`, background: meta.bg }}>
            <Hash size={12} /> {filteredWords.length} words
          </span>
          <span style={styles.badge}>
            {currentSet.fromLangLabel} → {currentSet.toLangLabel}
          </span>
          {usingFallback && (
            <span style={{ ...styles.badge, color: '#f59e0b', borderColor: '#f59e0b30', background: 'rgba(245,158,11,0.08)' }}>
              <WifiOff size={11} /> Demo Mode
            </span>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {filteredWords.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ color: '#475569', marginBottom: 12 }}><Search size={44} /></div>
          <p style={{ color: '#475569', fontSize: 13 }}>Nothing found</p>
          {search && (
            <button onClick={() => setSearch('')} style={styles.retryBtn}>
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredWords.map((item, i) => (
            <Flashcard
              key={`${selectedSetId}-${i}`}
              item={item}
              accent={meta.accent}
              isCustom={currentSet.isCustom}
              onDelete={deleteWord}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeUp 0.3s ease' }}>
           <form onSubmit={(e) => {
             e.preventDefault();
             saveVocabulary(newWord.word, newWord.meaning, newWord.sentence);
             setShowAddModal(false);
             setNewWord({ word: '', translation: '', meaning: '', sentence: '' });
           }} style={{ background: '#0f172a', padding: 32, borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: 420, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              <h3 style={{ color: '#fff', marginBottom: 24, fontSize: 24, fontWeight: 900, textAlign: 'center' }}>Add New Word</h3>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#4a9eff', marginBottom: 8, textTransform: 'uppercase' }}>English Word</label>
                <input 
                  placeholder="e.g. Resilience" 
                  value={newWord.word} 
                  onChange={e => setNewWord({...newWord, word: e.target.value})}
                  required style={styles.modalInput}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#4a9eff', marginBottom: 8, textTransform: 'uppercase' }}>Translation</label>
                <input 
                  placeholder="e.g. Toughness / Strength" 
                  value={newWord.meaning || newWord.translation} 
                  onChange={e => setNewWord({...newWord, meaning: e.target.value, translation: e.target.value})}
                  required style={styles.modalInput}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#4a9eff', marginBottom: 8, textTransform: 'uppercase' }}>Example Sentence</label>
                <textarea 
                  placeholder="e.g. Her resilience helped her win." 
                  value={newWord.sentence} 
                  onChange={e => setNewWord({...newWord, sentence: e.target.value})}
                  style={{ ...styles.modalInput, height: 100, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid #334155', background: 'rgba(255,255,255,0.02)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#4a9eff', color: '#fff', fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(74,158,255,0.4)' }}>
                  Add Word
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: { padding: 2, animation: 'fadeUp .4s ease-out' },
  center: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: 300,
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid rgba(56,189,248,0.1)',
    borderTop: '3px solid #38bdf8',
    animation: 'spin 1s linear infinite',
  },
  banner: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.25)',
    borderRadius: 12, padding: '10px 16px',
    color: '#f59e0b', fontSize: 12, fontWeight: 600,
    marginBottom: 20,
  },
  retryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'transparent',
    border: '1px solid currentColor',
    borderRadius: 8, color: 'inherit',
    fontSize: 11, fontWeight: 700,
    padding: '3px 10px', cursor: 'pointer',
    fontFamily: 'inherit',
  },
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 16, marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.6 },
  subtitle: { fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 600 },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, pointerEvents: 'none' },
  searchInput: {
    background: '#0f172a',
    border: '1.5px solid rgba(255,255,255,0.06)',
    borderRadius: 12, color: '#f1f5f9',
    fontSize: 14, padding: '10px 36px 10px 40px',
    outline: 'none', width: 220,
    transition: 'all .25s ease', fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute', right: 10,
    background: 'none', border: 'none',
    color: '#475569', fontSize: 18, cursor: 'pointer',
    lineHeight: 1, padding: '0 4px',
  },
  modalInput: {
    width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, padding: '12px 16px', color: '#fff', marginBottom: 16, outline: 'none', fontSize: 14,
    boxSizing: 'border-box'
  },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statsBar: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  badge: {
    display: 'inline-flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, color: '#64748b',
    fontSize: 12, fontWeight: 700,
    padding: '6px 14px', letterSpacing: 0.2, gap: 6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
  },
  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', minHeight: 200,
  },
};