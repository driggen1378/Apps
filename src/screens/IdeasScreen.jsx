import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAllFeeds, formatRelativeDate } from '../lib/rss';

const TABS = { FEED: 'feed', LATER: 'later', BOARD: 'board' };

export default function IdeasScreen() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState(TABS.FEED);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState(null);

  const hasFeeds = state.brand.rssFeeds.length > 0;

  useEffect(() => {
    if (hasFeeds && state.rssItems.length === 0) loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFeeds() {
    if (!hasFeeds) return;
    setFeedLoading(true);
    setFeedError(null);
    try {
      const items = await fetchAllFeeds(state.brand.rssFeeds);
      dispatch({ type: 'SET_RSS_ITEMS', items });
    } catch (err) {
      setFeedError('Some feeds failed to load. Check URLs in Brand Settings.');
    } finally {
      setFeedLoading(false);
    }
  }

  function saveForLater(item) {
    dispatch({ type: 'SAVE_FOR_LATER', item: { ...item, id: `later-${Date.now()}-${item.url}`, savedAt: new Date().toISOString() } });
  }

  function saveToBoard(item) {
    dispatch({ type: 'SAVE_TO_IDEAS_BOARD', item: { ...item, id: `board-${Date.now()}-${item.url}`, savedAt: new Date().toISOString() } });
  }

  const isSavedLater = (url) => state.savedForLater.some((i) => i.url === url);
  const isSavedBoard = (url) => state.ideasBoard.some((i) => i.url === url);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-0 border-b border-[#1e2130]">
        <h2 className="text-lg font-semibold text-white">Ideas</h2>
        <div className="flex gap-1">
          <TabButton active={tab === TABS.FEED} onClick={() => setTab(TABS.FEED)}>
            Feed {state.rssItems.length > 0 && <Badge>{state.rssItems.length}</Badge>}
          </TabButton>
          <TabButton active={tab === TABS.LATER} onClick={() => setTab(TABS.LATER)}>
            Saved for later {state.savedForLater.length > 0 && <Badge>{state.savedForLater.length}</Badge>}
          </TabButton>
          <TabButton active={tab === TABS.BOARD} onClick={() => setTab(TABS.BOARD)}>
            Ideas board {state.ideasBoard.length > 0 && <Badge highlight>{state.ideasBoard.length}</Badge>}
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-5 min-h-0">
        {tab === TABS.FEED && (
          <FeedTab
            items={state.rssItems}
            loading={feedLoading}
            error={feedError}
            hasFeeds={hasFeeds}
            onRefresh={loadFeeds}
            onSaveLater={saveForLater}
            onSaveBoard={saveToBoard}
            isSavedLater={isSavedLater}
            isSavedBoard={isSavedBoard}
          />
        )}
        {tab === TABS.LATER && (
          <SavedTab
            items={state.savedForLater}
            emptyLabel="Nothing saved for later yet. Hit the bookmark on any feed item."
            onRemove={(id) => dispatch({ type: 'REMOVE_SAVED_FOR_LATER', id })}
            onMoveToBoard={(id) => dispatch({ type: 'MOVE_TO_IDEAS_BOARD', id })}
            showMoveToBoard
          />
        )}
        {tab === TABS.BOARD && (
          <SavedTab
            items={state.ideasBoard}
            emptyLabel="Your ideas board is empty. Save articles here that you want to write from."
            onRemove={(id) => dispatch({ type: 'REMOVE_FROM_IDEAS_BOARD', id })}
          />
        )}
      </div>
    </div>
  );
}

// ── Feed tab ──────────────────────────────────────────────────────────────────

function FeedTab({ items, loading, error, hasFeeds, onRefresh, onSaveLater, onSaveBoard, isSavedLater, isSavedBoard }) {
  const { dispatch, SCREENS } = useApp();

  if (!hasFeeds) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <p className="text-sm text-slate-500">No RSS feeds configured yet.</p>
        <p className="text-xs text-slate-600">Add your influences' feeds in Brand Settings.</p>
        <button onClick={() => { dispatch({ type: 'SET_SCREEN', screen: SCREENS.BRAND }); }}
          className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all mt-1">
          Go to Brand Settings →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
        <p className="text-sm text-slate-500">Loading feeds…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">{items.length} articles across {new Set(items.map((i) => i.feedName)).size} feeds</p>
        <button onClick={onRefresh} className="text-xs text-slate-500 hover:text-white transition-colors">↻ Refresh</button>
      </div>

      {error && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-2 mb-4">
          <p className="text-xs text-amber-400">{error}</p>
        </div>
      )}

      {items.length === 0 && !loading && (
        <p className="text-sm text-slate-500 text-center py-8">No items loaded. Check your feed URLs in Brand Settings.</p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <FeedItem key={item.id} item={item}
            savedLater={isSavedLater(item.url)}
            savedBoard={isSavedBoard(item.url)}
            onSaveLater={() => onSaveLater(item)}
            onSaveBoard={() => onSaveBoard(item)} />
        ))}
      </div>
    </div>
  );
}

function FeedItem({ item, savedLater, savedBoard, onSaveLater, onSaveBoard }) {
  return (
    <div className="flex items-start gap-3 bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 hover:border-slate-600 transition-colors group">
      <div className="flex-1 min-w-0">
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium text-slate-200 hover:text-white leading-snug block mb-1 transition-colors">
          {item.title}
        </a>
        {item.description && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-1.5">{item.description}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 bg-[#1e2130] px-2 py-0.5 rounded-full">{item.feedName}</span>
          <span className="text-xs text-slate-700">{formatRelativeDate(item.pubDate)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onSaveLater} title="Save for later"
          className={`text-xs px-2 py-1 rounded border transition-all ${
            savedLater ? 'border-amber-600/60 text-amber-400 bg-amber-900/20' : 'border-[#2a2d3e] text-slate-600 hover:text-amber-400 hover:border-amber-600/40'
          }`}>
          {savedLater ? '✓' : '🔖'}
        </button>
        <button onClick={onSaveBoard} title="Save to ideas board"
          className={`text-xs px-2 py-1 rounded border transition-all ${
            savedBoard ? 'border-purple-600/60 text-purple-400 bg-purple-900/20' : 'border-[#2a2d3e] text-slate-600 hover:text-purple-400 hover:border-purple-600/40'
          }`}>
          {savedBoard ? '✓' : '💡'}
        </button>
      </div>
    </div>
  );
}

// ── Saved tabs ────────────────────────────────────────────────────────────────

function SavedTab({ items, emptyLabel, onRemove, onMoveToBoard, showMoveToBoard }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-slate-600 text-center max-w-xs">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-slate-200 hover:text-white leading-snug block mb-1 transition-colors">
              {item.title}
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 bg-[#1e2130] px-2 py-0.5 rounded-full">{item.source || item.feedName}</span>
              <span className="text-xs text-slate-700">{formatRelativeDate(item.savedAt)}</span>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {showMoveToBoard && (
              <button onClick={() => onMoveToBoard(item.id)} title="Move to ideas board"
                className="text-xs px-2 py-1 rounded border border-[#2a2d3e] text-slate-600 hover:text-purple-400 hover:border-purple-600/40 transition-all">
                💡
              </button>
            )}
            <button onClick={() => onRemove(item.id)}
              className="text-xs px-2 py-1 rounded border border-[#2a2d3e] text-slate-600 hover:text-red-400 hover:border-red-600/40 transition-all">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Small components ──────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
        active ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}>
      {children}
    </button>
  );
}

function Badge({ children, highlight }) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
      highlight ? 'bg-purple-900/40 text-purple-400' : 'bg-slate-800 text-slate-500'
    }`}>
      {children}
    </span>
  );
}
