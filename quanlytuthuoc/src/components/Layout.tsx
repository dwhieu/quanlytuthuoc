import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="app-layout d-flex">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>
      <main className="app-main flex-grow-1">
        <TopBar />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
