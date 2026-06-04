function BadgePicker({ options, selected, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((badge) => (
        <button key={badge.label} type="button" onClick={() => onSelect(badge.value)} className={`group overflow-hidden rounded-3xl border px-3 py-3 text-left transition ${selected === badge.value ? 'border-neon ring-2 ring-neon/20' : 'border-slate-700 hover:border-neon'}`}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-900">
              <img src={badge.value} alt={badge.label} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-white">{badge.label}</p>
              <p className="text-sm text-slate-400">Preset icon</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default BadgePicker;
