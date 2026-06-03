/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Overview from "./pages/dashboard/Overview";
import Campaigns from "./pages/dashboard/Campaigns";
import Payments from "./pages/dashboard/Payments";
import Analytics from "./pages/dashboard/Analytics";
import Messages from "./pages/dashboard/Messages";
import Settings from "./pages/dashboard/Settings";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminClients from "./pages/admin/AdminClients";
import AdminCampaigns from "./pages/admin/AdminCampaigns";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminReports from "./pages/admin/AdminReports";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="adpulse-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/services" element={<Services />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Client Dashboard Routes — protected, client role only */}
            <Route element={<ProtectedRoute requiredRole="client" />}>
              <Route path="/dashboard" element={<DashboardLayout role="client" />}>
                <Route index element={<Overview />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="payments" element={<Payments />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="messages" element={<Messages />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Admin Dashboard Routes — protected, admin role only */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<AdminOverview />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="campaigns" element={<AdminCampaigns />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
