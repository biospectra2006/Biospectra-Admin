import React from 'react';
import { RefreshCw } from 'lucide-react';

const Header = ({ activeTab, totalArticlesCount, totalIssuesCount, syncData }) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Analytics Overview';
      case 'publish': return 'Publishing Center';
      case 'explore': return 'Content Repository';
      case 'about': return 'Journal Architect';
      case 'security': return 'Security Center';
      case 'audit': return 'Security Audit';
      case 'editorial': return 'Team Directory';
      case 'gallery': return 'Media Library';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <header className="header-stack flex justify-between items-center mb-6">
      <div>
        <h2 className="m-0 text-3xl font-black text-[#133215] tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          {getTitle()}
        </h2>
        <p className="m-0 text-[#92B775] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Editorial Administrator</p>
      </div>
      
      <div className="flex gap-4 items-center mobile-hide">
        <div className="bg-white/80 backdrop-blur-md p-2.5 px-5 rounded-2xl border border-[#92B775]/10 flex gap-8 shadow-sm">
           <div>
             <p className="m-0 text-[0.6rem] text-[#133215]/40 font-black uppercase tracking-wider">Papers</p>
             <p className="m-0 text-lg font-black text-[#133215]">{totalArticlesCount}</p>
           </div>
           <div>
             <p className="m-0 text-[0.6rem] text-[#133215]/40 font-black uppercase tracking-wider">Volumes</p>
             <p className="m-0 text-lg font-black text-[#133215]">{totalIssuesCount}</p>
           </div>
        </div>
        
        <button 
          onClick={syncData}
          className="flex items-center gap-2.5 bg-[#133215] text-[#92B775] border-none p-3.5 px-5 rounded-2xl cursor-pointer font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#133215]/20"
        >
          <RefreshCw size={14} className="animate-spin" /> Sync Data
        </button>
      </div>
    </header>
  );
};

export default Header;
