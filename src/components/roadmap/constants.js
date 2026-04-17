export const AVAILABLE_TAGS = [
  'product', 'innovation', 'structuring', 'marketing',
  'operations', 'finance', 'people', 'tech',
]

export const TAG_COLORS = {
  product:      'bg-blue-900/30 text-blue-300 border-blue-800/40',
  innovation:   'bg-purple-900/30 text-purple-300 border-purple-800/40',
  structuring:  'bg-amber-900/30 text-amber-300 border-amber-800/40',
  marketing:    'bg-green-900/30 text-green-300 border-green-800/40',
  operations:   'bg-slate-700/30 text-slate-300 border-slate-600/40',
  finance:      'bg-red-900/30 text-red-300 border-red-800/40',
  people:       'bg-pink-900/30 text-pink-300 border-pink-800/40',
  tech:         'bg-cyan-900/30 text-cyan-300 border-cyan-800/40',
}

export const PRIORITY_COLORS = {
  high:   'bg-green-700 text-white',
  medium: 'bg-yellow-600 text-white',
  low:    'bg-slate-600 text-white',
}

export const STATUS_COLORS = {
  pending:     'bg-slate-700 text-slate-200',
  in_progress: 'bg-blue-700 text-white',
  done:        'bg-green-700 text-white',
}

export const TRACK_COLORS = {
  on:      'bg-green-700 text-white',
  at_risk: 'bg-amber-600 text-white',
  off:     'bg-red-700 text-white',
}

export const STATUS_LABELS = {
  pending: 'Pending', in_progress: 'In Progress', done: 'Done',
}
export const TRACK_LABELS = {
  on: 'On Track', at_risk: 'At Risk', off: 'Off Track',
}
export const PRIORITY_LABELS = {
  high: 'High', medium: 'Medium', low: 'Low',
}

// Gantt
export const ZOOM_CELL_WIDTH = { quarters: 220, months: 110, weeks: 64 }
export const GANTT_ROW_HEIGHT = 44
export const GANTT_LABEL_WIDTH = 260
