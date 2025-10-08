import React from 'react';
import Sidebar from './src/components/Sidebar';
import TopBar from "./src/components/TopBar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="d-flex">
      <div style={{ width: 250 }}>
        <Sidebar />
      </div>
      <div className="flex-grow-1 bg-white">
        <TopBar />
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
