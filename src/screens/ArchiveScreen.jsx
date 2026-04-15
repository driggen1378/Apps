import { storage } from '../lib/storage';

export default function ArchiveScreen() {
  const entries = storage.getArchive();

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0f1117] text-slate-200">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#1e2130]">
        <h2 className="text-lg font-semibold text-white">Archive</h2>
        <p className="text-xs text-slate-500 mt-0.5">Published pieces — read-only ledger</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500 text-center max-w-sm leading-relaxed">
              No published pieces yet. Complete the filter check and copy to clipboard to save a piece here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl">
            {entries.map(entry => (
              <ArchiveEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArchiveEntry({ entry }) {
  const question = (entry.question || '').slice(0, 80) + ((entry.question || '').length > 80 ? '…' : '');
  const date = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';
  const typeLabel = entry.outputType === 'podcast' ? 'Podcast' : 'Newsletter';
  const typeColor = entry.outputType === 'podcast' ? 'text-purple-400 bg-purple-900/40' : 'text-blue-400 bg-blue-900/40';

  return (
    <div className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium leading-snug">{question || '(no question)'}</p>
          {entry.subjectLine && (
            <p className="text-xs text-slate-400 mt-1.5">
              <span className="text-amber-400">Subject:</span> {entry.subjectLine}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColor}`}>
          {typeLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3">
        {entry.wordCount ? (
          <span className="text-xs text-slate-600">{entry.wordCount} words</span>
        ) : null}
        <span className="text-xs text-slate-600">{date}</span>
      </div>
    </div>
  );
}
