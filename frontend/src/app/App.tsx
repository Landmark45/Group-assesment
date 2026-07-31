import { Navigate, Route, Routes } from 'react-router-dom';

import { CourseCatalogPage } from '../domains/catalog/pages/CourseCatalogPage';
import { CourseDetailPage } from '../domains/catalog/pages/CourseDetailPage';
import { CreateCoursePage } from '../domains/catalog/pages/CreateCoursePage';
import { EditCoursePage } from '../domains/catalog/pages/EditCoursePage';
import { MyCoursesPage } from '../domains/catalog/pages/MyCoursesPage';
import { ProfilePage } from '../domains/identity/pages/ProfilePage';
import { RegisterPage } from '../domains/identity/pages/RegisterPage';
import { SignInPage } from '../domains/identity/pages/SignInPage';
import { DashboardPage } from '../domains/learning/pages/DashboardPage';
import { AppShell } from './AppShell';
import { NotFoundPage } from './NotFoundPage';
import { GuestOnlyRoute, ProtectedRoute } from './ProtectedRoute';

/**
 * The route table, grouped by who is allowed in.
 *
 * Note the ordering inside /courses: the literal "new" segment is declared
 * before ":courseId", so navigating to /courses/new opens the editor rather
 * than trying to look up a course called "new".
 */
export function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public */}
        <Route index element={<Navigate to="/courses" replace />} />
        <Route path="courses" element={<CourseCatalogPage />} />

        {/* Guest-only */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="login" element={<SignInPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Signed in only — the guard redirects to /login and remembers where you were headed. */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="courses/new" element={<CreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={<EditCoursePage />} />
        </Route>

        {/* Public, but declared last so the literal routes above win. */}
        <Route path="courses/:courseId" element={<CourseDetailPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
