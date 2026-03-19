/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Overview from "./pages/dashboard/Overview";
import Campaigns from "./pages/dashboard/Campaigns";
import Payments from "./pages/dashboard/Payments";
import AdminOverview from "./pages/admin/AdminOverview";
import { ThemeProvider } from "./components/ThemeProvider";

// Placeholder for missing pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-[50vh] text-muted-foreground">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p>This page is under construction.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="adpulse-theme">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Client Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout role="client" />}>
            <Route index element={<Overview />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="payments" element={<Payments />} />
            <Route path="analytics" element={<Placeholder title="Analytics" />} />
            <Route path="messages" element={<Placeholder title="Messages" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminOverview />} />
            <Route path="clients" element={<Placeholder title="Manage Clients" />} />
            <Route path="campaigns" element={<Placeholder title="Manage Campaigns" />} />
            <Route path="analytics" element={<Placeholder title="Update Analytics" />} />
            <Route path="payments" element={<Placeholder title="Payment Monitoring" />} />
            <Route path="reports" element={<Placeholder title="Reports" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
