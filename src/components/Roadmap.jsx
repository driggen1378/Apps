import { useState } from 'react'
import { useRoadmap } from './roadmap/useRoadmap'
import ChatTab from './roadmap/ChatTab'
import BoardTab from './roadmap/BoardTab'
import TimelineTab from './roadmap/TimelineTab'

const TABS = [
  { id: 'chat',     label: 'Chat',     desc: 'Generate OKRs from plain text' },
  { id: 'board',    label: 'Board',    desc: 'Objectives · Key Results · Targets' },
  { id: 'timeline', label: 'Timeline', desc: 'Gantt chart view' },
]

export default function Roadmap() {
  const [tab, setTab] = useState('chat')
  const roadmap = useRoadmap()
  const hasItems = roadmap.objectives.length > 0

  function handleImport(parsed) {
    roadmap.importOKRs(parsed)
    setTab('board')
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a1628] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-[#1e3a5f] shrink-0">
        <div className="flex items-end gap-6">
          <div className="pb-3">
            <h2 className="text-base font-semibold text-white">Roadmap</h2>
            <p className="text-xs text-[#6a80a0] mt-0.5">
              {hasItems
                ? `${roadmap.objectives.length} objectives · ${roadmap.keyResults.length} key results · ${roadmap.targets.length} targets`
                : 'Describe your plan and generate OKRs'}
            </p>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.id
                    ? 'border-[#c5a028] text-[#c5a028]'
                    : 'border-transparent text-[#6a80a0] hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {tab === 'chat' && <ChatTab onImport={handleImport} />}
        {tab === 'board' && <BoardTab roadmap={roadmap} />}
        {tab === 'timeline' && <TimelineTab roadmap={roadmap} />}
      </div>
    </div>
  )
}
