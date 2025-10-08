import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="d-flex">
      <aside style={{ width: 250 }}>
        <Sidebar />
      </aside>
      <main style={{ flex: 1 }}>
        <TopBar />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
