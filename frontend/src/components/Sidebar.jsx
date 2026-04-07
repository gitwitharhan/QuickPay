import React from 'react';
import AbstractLogo from './AbstractLogo';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isOpen, setIsOpen }) {
  const isSystemUser = user?.email?.toLowerCase() === import.meta.env.VITE_SYSTEM_EMAIL?.toLowerCase();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'wallets', label: isSystemUser ? 'User Directory' : 'My Wallets', icon: '💳' },
    { id: 'activity', label: 'Activity', icon: '📝' },
    { id: 'requests', label: 'User Requests', icon: '📋' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 flex flex-col border-r border-white/5 bg-[#030303]/80 backdrop-blur-3xl z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-8 pb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AbstractLogo size={32} />
          <span className="font-['Syne'] font-extrabold text-xl tracking-tight text-white">QuickPay.</span>
        </div>
        <button 
          className="md:hidden text-white/50 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if(window.innerWidth < 768) setIsOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 font-['Inter'] text-sm font-medium ${
              activeTab === item.id 
                ? 'bg-white/10 text-white shadow-lg shadow-white/5 border border-white/10 opacity-100' 
                : 'text-white/40 hover:text-white hover:bg-white/5 opacity-80 hover:opacity-100'
            }`}
          >
            <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-white/5">
        <div className="flex items-center gap-4 px-4 py-4 mb-4 rounded-xl bg-white/[0.02]">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center font-bold text-white/90">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/30 truncate uppercase tracking-widest">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full py-3 text-xs font-semibold uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all duration-300"
        >
          End Session
        </button>
      </div>
    </aside>
    </>
  );
}
