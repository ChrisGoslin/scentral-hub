'use client';

// The Lexicon — a repository of olfactory wisdom and personal insights.

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = 'lexicon-wisdom';

const categories = [
  'Olfactory Families',
  'Layering Protocols',
  'Projection & Sillage',
  'Longevity Dynamics',
  'Chemical Resonance',
  'Other',
];

function readStoredNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Note[]) : [];
  } catch {
    return [];
  }
}

export default function LexiconPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [showAddSection, setShowAddSection] = useState(false);

  // Initialize notes on client side to avoid hydration mismatch
  useEffect(() => {
    setNotes(readStoredNotes());
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      } catch {
        // Silent failure for storage issues
      }
    }
  }, [notes]);

  const addNote = () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setShowAddSection(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-12">
          <div className="space-y-3">
            <h1 className="editorial-title text-5xl">The Lexicon</h1>
            <p className="text-stone-500 text-sm uppercase tracking-[0.2em]">
              A repository of olfactory wisdom
            </p>
          </div>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="inline-flex items-center gap-3 bg-stone-900 text-stone-50 px-8 py-3 rounded-sm transition-all text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg hover:bg-stone-800"
          >
            {showAddSection ? 'Close Portal' : 'Record Wisdom'}
            <span className="text-[#c49a3c]">{showAddSection ? '×' : '＋'}</span>
          </button>
        </header>

        {showAddSection && (
          <section className="luxury-card p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="editorial-title text-2xl text-[#c49a3c]">New Observation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Humidity on Vetiver"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-stone-50 border-b border-stone-200 py-2 focus:outline-none focus:border-[#c49a3c] transition-colors font-serif text-lg placeholder:text-stone-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 border-b border-stone-200 py-2 focus:outline-none focus:border-[#c49a3c] transition-colors appearance-none text-stone-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Reflections</label>
                  <textarea
                    placeholder="Document your findings..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full bg-stone-50 border border-stone-100 rounded-sm p-4 focus:outline-none focus:border-[#c49a3c] transition-colors resize-none h-full font-serif text-stone-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={addNote}
                className="bg-[#c49a3c] text-white px-10 py-4 rounded-sm text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#b38a32] transition-colors shadow-md"
              >
                Save to Lexicon
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-stone-100/50 border border-dashed border-stone-200 rounded-sm">
              <p className="text-stone-400 font-serif italic">The Lexicon is currently awaiting your first observation.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group luxury-card p-8 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 bg-stone-100 text-stone-500 rounded-full">
                    {note.category}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-800 transition-all"
                  >
                    ×
                  </button>
                </div>
                
                <h3 className="text-xl font-serif text-stone-900 mb-4 group-hover:text-[#c49a3c] transition-colors">{note.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-8 font-serif italic whitespace-pre-wrap">
                  {note.content}
                </p>
                
                <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      <footer className="py-20 text-center border-t border-stone-200 mt-20">
        <p className="text-stone-300 text-[10px] uppercase tracking-[0.4em] font-bold">
          Scentral · Eternal Wisdom
        </p>
      </footer>
    </div>
  );
}
