import { useApp } from './context/AppContext';
import InputScreen from './screens/InputScreen';
import QAScreen from './screens/QAScreen';
import DraftScreen from './screens/DraftScreen';
import HeadlinesScreen from './screens/HeadlinesScreen';
import FilterScreen from './screens/FilterScreen';
import Sidebar from './components/Sidebar';

function AppShell({ children, showSidebar }) {
  if (!showSidebar) {
    return <div className="min-h-screen bg-[#0f1117]">{children}</div>;
  }
  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const { state, SCREENS } = useApp();

  const showSidebar = state.screen !== SCREENS.INPUT;

  const screen = {
    [SCREENS.INPUT]: <InputScreen />,
    [SCREENS.QA]: <QAScreen />,
    [SCREENS.DRAFT]: <DraftScreen />,
    [SCREENS.HEADLINES]: <HeadlinesScreen />,
    [SCREENS.FILTER]: <FilterScreen />,
  }[state.screen] ?? <InputScreen />;

  return (
    <AppShell showSidebar={showSidebar}>
      {screen}
    </AppShell>
  );
}
