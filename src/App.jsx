import { useApp } from './context/AppContext';
import HomeScreen from './screens/HomeScreen';
import QAScreen from './screens/QAScreen';
import DraftScreen from './screens/DraftScreen';
import HeadlinesScreen from './screens/HeadlinesScreen';
import FilterScreen from './screens/FilterScreen';
import DiscoveryScreen from './screens/DiscoveryScreen';
import IdeasScreen from './screens/IdeasScreen';
import BrandScreen from './screens/BrandScreen';
import Sidebar from './components/Sidebar';

const SIDEBAR_SCREENS = new Set(['qa', 'draft', 'headlines', 'filter', 'discovery', 'ideas', 'brand']);

export default function App() {
  const { state, SCREENS } = useApp();

  const showSidebar = SIDEBAR_SCREENS.has(state.screen);

  const screenMap = {
    [SCREENS.HOME]: <HomeScreen />,
    [SCREENS.QA]: <QAScreen />,
    [SCREENS.DRAFT]: <DraftScreen />,
    [SCREENS.HEADLINES]: <HeadlinesScreen />,
    [SCREENS.FILTER]: <FilterScreen />,
    [SCREENS.DISCOVERY]: <DiscoveryScreen />,
    [SCREENS.IDEAS]: <IdeasScreen />,
    [SCREENS.BRAND]: <BrandScreen />,
  };

  const screen = screenMap[state.screen] ?? <HomeScreen />;

  if (!showSidebar) {
    return <div className="min-h-screen bg-[#0f1117]">{screen}</div>;
  }

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {screen}
      </main>
    </div>
  );
}
