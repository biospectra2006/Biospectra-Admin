import React from 'react';
import { 
  BarChart3, Upload, Database, 
  Info, Users, Image, ShieldCheck, Shield 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout, P }) => {
  const menuItems = [
    { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
    { id: 'publish', label: 'Upload New', icon: Upload },
    { id: 'explore', label: 'All Articles', icon: Database },
    { id: 'about', label: 'Journal Info', icon: Info },
    { id: 'editorial', label: 'Team Board', icon: Users },
    { id: 'gallery', label: 'Photos', icon: Image },
    { id: 'security', label: 'Security Center', icon: ShieldCheck },
    { id: 'audit', label: 'Security Log', icon: Shield },
  ];

  const mobileItems = [
    { id: 'analytics', icon: BarChart3, label: 'Stats' },
    { id: 'publish', icon: Upload, label: 'Add' },
    { id: 'explore', icon: Database, label: 'Papers' },
    { id: 'about', icon: Info, label: 'Info' },
    { id: 'editorial', icon: Users, label: 'Team' },
    { id: 'gallery', icon: Image, label: 'Photos' },
    { id: 'security', icon: ShieldCheck, label: 'Guard' },
    { id: 'audit', icon: Shield, label: 'Sec' },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="sidebar bg-white border-r border-slate-200 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-8 px-1">
          <img 
            src="/logo/biospectra-logo.jpg" 
            alt="Biospectra Logo" 
            className="w-10 h-10 rounded-xl object-contain shadow-sm border border-slate-100 bg-white p-1 shrink-0" 
          />
          <div className="sidebar-text">
            <h1 className="m-0 text-base font-black text-[#133215] tracking-tight leading-tight uppercase" style={{ fontFamily: 'var(--font-playfair), serif' }}>Biospectra</h1>
            <span className="text-[0.6rem] font-bold text-[#92B775] uppercase tracking-[0.2em]">Admin Panel</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-center lg:justify-start gap-3 p-3.5 rounded-xl border-none cursor-pointer transition-all duration-300 text-[13px] ${
                activeTab === item.id 
                  ? 'bg-[#133215] text-[#92B775] font-black shadow-xl shadow-[#133215]/20' 
                  : 'bg-transparent text-[#133215]/50 font-bold hover:bg-[#eef4ec] hover:text-[#133215]'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              <span className="sidebar-text whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-[#92B775]/10">
          <button 
            onClick={handleLogout}
            className="w-full flex justify-center p-3.5 bg-red-50 text-red-600 border-none rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer mb-6 transition-all hover:bg-red-100 active:scale-95"
          >
            <span className="sidebar-text">Log Out</span>
            <span className="lg:hidden text-lg">⏻</span>
          </button>
          <div className="flex items-center justify-center lg:justify-start gap-2.5 p-1">
            <div className="w-2 h-2 bg-[#92B775] rounded-full shadow-[0_0_10px_rgba(146,183,117,0.6)] animate-pulse shrink-0" />
            <span className="sidebar-text text-[0.65rem] font-black text-[#133215]/30 uppercase tracking-[0.25em]">System Live</span>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="mobile-nav">
        {mobileItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === item.id ? P.primary : '#94a3b8',
              padding: '0.4rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              cursor: 'pointer'
            }}
          >
            <item.icon size={18} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
