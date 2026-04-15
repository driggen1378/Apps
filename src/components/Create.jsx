import { AppProvider, useApp } from '../context/AppContext'
import HomeScreen from '../screens/HomeScreen'
import QAScreen from '../screens/QAScreen'
import DraftScreen from '../screens/DraftScreen'
import HeadlinesScreen from '../screens/HeadlinesScreen'
import FilterScreen from '../screens/FilterScreen'
import DiscoveryScreen from '../screens/DiscoveryScreen'
import QuestionFormationScreen from '../screens/QuestionFormationScreen'
import TensionMapScreen from '../screens/TensionMapScreen'
import IdeaExtractionScreen from '../screens/IdeaExtractionScreen'

function CreateInner() {
  const { state, SCREENS } = useApp()

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0f1117] text-slate-200">
      {state.screen === SCREENS.HOME               && <HomeScreen />}
      {state.screen === SCREENS.QA                 && <QAScreen />}
      {state.screen === SCREENS.DRAFT              && <DraftScreen />}
      {state.screen === SCREENS.HEADLINES          && <HeadlinesScreen />}
      {state.screen === SCREENS.FILTER             && <FilterScreen />}
      {state.screen === SCREENS.DISCOVERY          && <DiscoveryScreen />}
      {state.screen === SCREENS.QUESTION_FORMATION && <QuestionFormationScreen />}
      {state.screen === SCREENS.TENSION_MAP        && <TensionMapScreen />}
      {state.screen === SCREENS.IDEA_EXTRACTION    && <IdeaExtractionScreen />}
    </div>
  )
}

export default function Create() {
  return (
    <AppProvider>
      <CreateInner />
    </AppProvider>
  )
}
