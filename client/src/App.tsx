import { Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

import { queryClient } from "./lib/queryClient";

import Login from "@/pages/Login";
import Dashboard from "@/pages/dashboard";
import PropertyList from "@/pages/property-list";
import TenantList from "@/pages/tenant-list";
import PropertyView from "@/pages/property-view";
import PropertyEdit from "@/pages/property-edit";
import NotFound from "@/pages/not-found";
import AddProperty from "@/pages/AddProperty";
import TenantDashboard from "@/pages/dashboardTenant";
import TemplateEditorPage from "@/pages/TemplateEditorPage";
import TenantEdit from "@/pages/TenantEdit";
import PropertyUserView from "@/pages/property-user-view";


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard-tenant" element={<TenantDashboard />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/tenants" element={<TenantList />} />
          <Route path="/property/:id" element={<PropertyView />} />
          <Route path="/property-edit/:id" element={<PropertyEdit />} />
          <Route path="/addproperties" element={<AddProperty />} />
          <Route path="/settings" element={<TemplateEditorPage />} />
          <Route path="/tenants/edit/:id" element={<TenantEdit />} />
          <Route path="/property-view/:id" element={<PropertyUserView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </TooltipProvider>
    </QueryClientProvider>
  );
}
