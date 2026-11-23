import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ArenaPage } from './pages/ArenaPage';
import { DashboardPage } from './pages/DashboardPage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProblemLibraryPage } from './pages/ProblemLibraryPage';
import { ProblemPage } from './pages/ProblemPage';
import { RankingsPage } from './pages/RankingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="learn/:lessonId" element={<LessonPage />} />
        <Route path="practice" element={<ProblemLibraryPage kind="practice" />} />
        <Route path="practice/:problemId" element={<ProblemPage />} />
        <Route path="challenges" element={<ProblemLibraryPage kind="challenge" />} />
        <Route path="challenges/:problemId" element={<ProblemPage />} />
        <Route path="arena" element={<ArenaPage />} />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
