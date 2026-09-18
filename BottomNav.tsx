'use client';

export default function BottomNav({ active, onChange }: {
  active: string;
  onChange: (value: string) => void;
}) {
  const items = [
    ['home', 'Home'],
    ['workout', 'Allenamento'],
    ['progress', 'Progressi'],
    ['profile', 'Profilo'],
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0d0e0e]/95 backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2 py-4 text-xs font-bold transition ${
              active === key ? 'text-[#D6A62E]' : 'text-white/45'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
