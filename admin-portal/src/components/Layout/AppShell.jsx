import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppShell = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const sidebarWidth = sidebarCollapsed ? '70px' : '240px';

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#060606',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
      />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <TopBar
          onMenuClick={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          isMobile={isMobile}
        />

        <main style={{
          flex: 1,
          marginTop: '64px',
          padding: '32px 28px',
          overflowY: 'auto',
          backgroundColor: '#060606',
        }}>
          <Outlet />
        </main>
      </div>

      {isMobile && !sidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 149,
          }}
        />
      )}
    </div>
  );
};

export default AppShell;