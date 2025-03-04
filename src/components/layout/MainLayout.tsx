
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        className={cn(
          "fixed inset-y-0 z-50 transition-transform duration-300 ease-in-out",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0",
          !isMobile ? "w-64" : "w-64"
        )}
      />

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          !isMobile && "ml-64"
        )}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
