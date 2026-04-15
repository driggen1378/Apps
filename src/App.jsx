import { useState } from 'react'
import BrandSettings from './components/BrandSettings'
import Create from './components/Create'
import Ideas from './components/Ideas'
import ArchiveScreen from './screens/ArchiveScreen'
import { storage } from './lib/storage'

const NAV = [
  { id: 'create',   label: 'Create',         icon: '✍️' },
  { id: 'ideas',    label: 'Ideas',           icon: '💡' },
  { id: 'archive',  label: 'Archive',         icon: '📁' },
  { id: 'settings', label: 'Brand Settings',  icon: '⚙️' },
]

function SidebarNav({ section, onNavigate, onClose }) {
  return (
    <div className="w-52 bg-[#071020] border-r border-[#1e3a5f] flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-[#1e3a5f] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#c5a028] rounded flex items-center justify-center shrink-0">
            <span className="text-[#071020] font-bold text-xs">LL</span>
          </div>
          <span className="text-[#c5a028] font-bold text-xs tracking-widest uppercase leading-tight">
            Lessons<br/>Learned
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#7a9ab5] hover:text-white text-lg leading-none p-1"
          >
            ✕
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              section === n.id
                ? 'bg-[#c5a028] text-[#071020]'
                : 'text-[#7a9ab5] hover:text-white hover:bg-[#112040]'
            }`}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  const [section, setSection] = useState('create')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(id) {
    setSection(id)
    setSidebarOpen(false)
  }

  function handleDraftFromIdea(text) {
    storage.setDraftSeed(text)
    setSection('create')
  }

  return (
    // fixed inset-0 fills the exact visible viewport on iOS — avoids the 100vh URL-bar bug
    <div className="fixed inset-0 flex bg-[#0a1628] text-white">

      {/* Desktop sidebar — always in flow, hidden on mobile */}
      <aside className="hidden md:block shrink-0">
        <SidebarNav section={section} onNavigate={navigate} />
      </aside>

      {/* Mobile sidebar drawer — mounted on top when open */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <SidebarNav section={section} onNavigate={navigate} onClose={() => setSidebarOpen(false)} />
          {/* Tap-outside backdrop */}
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[#1e3a5f] bg-[#071020] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#7a9ab5] hover:text-white p-1"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#c5a028] rounded flex items-center justify-center shrink-0">
              <span className="text-[#071020] font-bold" style={{fontSize:'9px'}}>LL</span>
            </div>
            <span className="text-[#c5a028] font-bold text-xs tracking-widest uppercase">
              {NAV.find(n => n.id === section)?.label || 'Lessons Learned'}
            </span>
          </div>
        </div>

        {/* Section content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {section === 'create'   && <Create />}
          {section === 'ideas'    && <Ideas onDraftFromIdea={handleDraftFromIdea} />}
          {section === 'archive'  && <ArchiveScreen />}
          {section === 'settings' && <BrandSettings />}
        </div>

      </main>
    </div>
  )
}
