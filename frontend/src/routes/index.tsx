import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Layouts
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Load route code on demand so charts and account flows don't delay the home page.
const HomePage = lazy(() => import('@/pages/HomePage'))
const SignInPage = lazy(() => import('@/pages/SignInPage'))
const SignUpPage = lazy(() => import('@/pages/SignUpPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'))
const AnimePage = lazy(() => import('@/pages/AnimePage'))
const MoviesPage = lazy(() => import('@/pages/MoviesPage'))
const SeriesPage = lazy(() => import('@/pages/SeriesPage'))
const MediaDetailsPage = lazy(() => import('@/pages/MediaDetailsPage'))
const MediaFetchPage = lazy(() => import('@/pages/MediaFetchPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'))
const CookiePolicyPage = lazy(() => import('@/pages/CookiePolicyPage'))
const ContentPolicyPage = lazy(() => import('@/pages/ContentPolicyPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

export const AppRouter = () => {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-dvh items-center justify-center bg-background" role="status" aria-label="Loading page">
          <LoadingSpinner size="lg" />
        </div>
      )}
    >
      <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="anime" element={<AnimePage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="series" element={<SeriesPage />} />
        <Route path="media/:id" element={<MediaDetailsPage />} />
        <Route path="media/fetch" element={<MediaFetchPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="cookies" element={<CookiePolicyPage />} />
        <Route path="content-policy" element={<ContentPolicyPage />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="library" element={<LibraryPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
