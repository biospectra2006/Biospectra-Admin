import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  handleLogout, 
  totalArticlesCount, 
  totalIssuesCount, 
  syncData,
  P 
}) => {
  return (
    <div className="admin-container h-screen overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        P={P}
      />

      <main className="main-content-wrapper flex-1 p-6 md:p-10 overflow-y-auto bg-[#eef4ec] custom-scrollbar">
        <Header 
          activeTab={activeTab}
          totalArticlesCount={totalArticlesCount}
          totalIssuesCount={totalIssuesCount}
          syncData={syncData}
        />
        
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
