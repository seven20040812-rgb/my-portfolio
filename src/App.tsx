import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PageLoader } from "@/components/ui/PageLoader";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import { HomePage } from "@/pages/public/HomePage";
import { AboutPage } from "@/pages/public/AboutPage";
import { ProjectsPage } from "@/pages/public/ProjectsPage";
import { ProjectDetailPage } from "@/pages/public/ProjectDetailPage";
import { ResumePage } from "@/pages/public/ResumePage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";

const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const ProfileEditPage = lazy(() => import("@/pages/admin/ProfileEditPage"));
const ProjectsManagePage = lazy(() => import("@/pages/admin/ProjectsManagePage"));
const ResumeManagePage = lazy(() => import("@/pages/admin/ResumeManagePage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/:id" element={<ProjectDetailPage />} />
                  <Route path="resume" element={<ResumePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route path="/admin/login" element={<LoginPage />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="profile" element={<ProfileEditPage />} />
                  <Route path="projects" element={<ProjectsManagePage />} />
                  <Route path="resume" element={<ResumeManagePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
