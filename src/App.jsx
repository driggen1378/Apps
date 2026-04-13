import { useState } from 'react'
import BrandSettings from './components/BrandSettings'
import Create from './components/Create'
import Ideas from './components/Ideas'

const NAV = [
  { id: 'create', label: 'Create', icon: '✍️' },
  { id: 'ideas',  label: 'Ideas',  icon: '💡' },
  { id: 'settings', label: 'Brand Settings', icon: '⚙️' },
]

export default function App() {
  const [section, setSection] = useState('create')

  return (
    <div className="flex h-screen bg-[#0a1628] text-white overflow-hidden">
      <aside className="w-52 bg-[#071020] border-r border-[#1e3a5f] flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#c5a028] rounded flex items-center justify-center shrink-0">
              <span className="text-[#071020] font-bold text-xs">LL</span>
            </div>
            <span className="text-[#c5a028] font-bold text-xs tracking-widest uppercase leading-tight">
              Lessons<br/>Learned
            </span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
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
      </aside>

      <main className="flex-1 overflow-hidden">
        {section === 'create'   && <Create />}
        {section === 'ideas'    && <Ideas />}
        {section === 'settings' && <BrandSettings />}
      </main>
    </div>
  )
}
