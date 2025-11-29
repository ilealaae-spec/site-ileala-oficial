import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutWrapperProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

export default function AdminLayoutWrapper({
  children,
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
}: AdminLayoutWrapperProps) {
  console.log('[AdminLayoutWrapper] RENDERING NEW LAYOUT!!!');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
        onLogout={onLogout}
      />

      {/* Header */}
      <AdminHeader 
        userName={userName} 
        userEmail={userEmail} 
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
