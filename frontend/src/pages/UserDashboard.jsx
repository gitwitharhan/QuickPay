import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AbstractLogo from '../components/AbstractLogo';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { fetchUserAccounts, fetchAccountDetails, createAccount } from '../api/accountService';
import { createTransaction, createInitialTransaction } from '../api/transactionService';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Transaction form states
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txMessage, setTxMessage] = useState(null);

  // Check if current user is System User
  const isSystemUser = user?.email?.toLowerCase() === import.meta.env.VITE_SYSTEM_EMAIL?.toLowerCase();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isSystemUser) {
      loadAccounts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accs = await fetchUserAccounts();
      setAccounts(accs);
      if (accs.length > 0) {
        // If no account selected, pick the first one
        if (!selectedAccount) {
          const details = await fetchAccountDetails(accs[0]._id);
          setSelectedAccount(details.account);
          setBalance(details.balance);
        } else {
          // Keep current selection but refresh balance
          const details = await fetchAccountDetails(selectedAccount._id);
          setSelectedAccount(details.account);
          setBalance(details.balance);
        }
      }
    } catch (err) {
      setError('Failed to load accounts. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = async (accId) => {
    setError(null);
    try {
      const details = await fetchAccountDetails(accId);
      setSelectedAccount(details.account);
      setBalance(details.balance);
    } catch (err) {
      setError('Failed to switch account.');
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      await createAccount();
      await loadAccounts();
    } catch (err) {
      setError('Failed to create account. ' + (err.message || ''));
      setLoading(false);
    }
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    setTxMessage(null);

    if (!toAccount || !amount || parseFloat(amount) <= 0) {
      setTxMessage({ type: 'error', text: 'Please provide valid account ID and positive amount.' });
      return;
    }

    setTxLoading(true);
    const idempotencyKey = crypto.randomUUID();

    try {
      if (isSystemUser) {
        await createInitialTransaction({
          toAccount,
          amount: parseFloat(amount),
          idempotencyKey
        });
        setTxMessage({ type: 'success', text: 'Initial transaction sent successfully!' });
      } else {
        if (!selectedAccount) {
          setTxMessage({ type: 'error', text: 'No selected account to send from.' });
          setTxLoading(false);
          return;
        }
        await createTransaction({
          fromAccount: selectedAccount._id,
          toAccount,
          amount: parseFloat(amount),
          idempotencyKey
        });
        setTxMessage({ type: 'success', text: 'Transaction sent successfully!' });
        
        // Refresh balance
        const details = await fetchAccountDetails(selectedAccount._id);
        setBalance(details.balance);
      }
      // Reset form
      setToAccount('');
      setAmount('');
    } catch (err) {
      setTxMessage({ type: 'error', text: err.message || 'Transaction failed.' });
    } finally {
      setTxLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex select-none overflow-hidden font-['Inter']">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Interactive Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-white/[0.02] rounded-full blur-[100px] animate-float-fast" />
        <div className="absolute top-[40%] left-[30%] w-[250px] h-[250px] bg-white/[0.015] rounded-full blur-[80px] animate-rotate-slow" />
      </div>

      <main className="flex-1 ml-72 h-screen overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto p-10 pb-24">
          
          <header className="flex justify-between items-end mb-12">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium mb-2 font-['Syne']">QuickPay Platform v1.0</p>
              <h1 className="text-4xl font-extrabold tracking-tight font-['Syne'] text-white/90">
                {activeTab === 'overview' ? `Welcome, ${user.name.split(' ')[0]}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Local Time</p>
              <p className="text-sm font-medium text-white/60 tabular-nums">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-white/20 animate-pulse">
              <AbstractLogo size={48} />
              <p className="mt-4 text-xs tracking-widest uppercase">Initializing Secure Session...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-center backdrop-blur-3xl">
               <p className="font-['Syne'] font-bold text-lg mb-2">Sync Error</p>
               <p className="text-sm opacity-80">{error}</p>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Available Liquidity" 
                      value={balance !== null ? balance.toLocaleString('en-IN') : '0.00'} 
                      suffix="₹"
                      trend={2.4}
                      icon="📈"
                    />
                    <StatCard 
                      title="Active Wallets" 
                      value={accounts.length} 
                      icon="💳"
                    />
                    <StatCard 
                      title="Monthly Spend" 
                      value="4,250" 
                      suffix="₹"
                      trend={-12}
                      icon="📉"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                      {/* Initialize New Node Prompt */}
                      <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl flex items-center justify-between group hover:border-white/20 transition-all duration-500 overflow-hidden relative">
                        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
                        <div className="relative z-10">
                          <h3 className="font-['Syne'] font-bold text-white/90 text-lg mb-1">Scale your Infrastructure</h3>
                          <p className="text-white/40 text-xs">Deploy a new identity node to increase your liquidity routing capacity.</p>
                        </div>
                        <button 
                          onClick={handleCreateAccount}
                          className="relative z-10 px-8 py-4 rounded-2xl bg-white text-black font-['Syne'] font-extrabold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                          Initialize New Node
                        </button>
                      </div>

                      <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="font-['Syne'] font-bold text-white/80">Asset Allocation</h3>
                          <div className="flex gap-2 text-[10px] tracking-widest uppercase text-white/30">
                            <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">Weekly</span>
                            <span className="px-2 py-1 text-white/10 hover:text-white/40 cursor-pointer">Monthly</span>
                          </div>
                        </div>
                        <div className="h-48 w-full flex items-end gap-3 justify-between px-2">
                           {[40, 65, 35, 85, 45, 95, 60, 50, 75, 45].map((h, i) => (
                             <div key={i} className="flex-1 bg-gradient-to-t from-white/10 to-white/30 rounded-t-lg transition-all duration-500 hover:to-white hover:from-white/50 cursor-pointer relative group" style={{ height: `${h}%` }}>
                               <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-2 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  ₹{h * 123}
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                          <h3 className="font-['Syne'] font-bold text-white/80">Latest Operations</h3>
                          <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">Digital Ledger</button>
                        </div>
                        <div className="space-y-3">
                          {[
                            { name: 'Apple Digital', type: 'Payment', amount: '- ₹499', status: 'Completed', color: 'rose' },
                            { name: isSystemUser ? 'General Credit' : 'System Bonus', type: 'Deposit', amount: '+ ₹2,500', status: 'Success', color: 'emerald' },
                            { name: 'Amazon Warehouse', type: 'Purchase', amount: '- ₹1,200', status: 'Pending', color: 'amber' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                               <div className="flex items-center gap-4">
                                 <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl bg-${item.color}-500/10 text-${item.color}-400 border border-${item.color}-500/20`}>
                                   {item.name[0]}
                                 </div>
                                 <div>
                                   <p className="text-sm font-semibold text-white/90">{item.name}</p>
                                   <p className="text-[10px] uppercase tracking-widest text-white/30">{item.type}</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className={`text-sm font-bold ${item.amount.startsWith('+') ? 'text-emerald-400' : 'text-white/90'}`}>{item.amount}</p>
                                 <p className={`text-[9px] uppercase font-bold tracking-tighter px-1.5 py-0.5 rounded ${
                                   item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                                   item.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                 }`}>{item.status}</p>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl sticky top-10">
                          <h3 className="font-['Syne'] font-bold text-white/80 mb-6 flex items-center gap-2">
                             {isSystemUser ? "Force Dispatch" : "Immediate Transfer"}
                             <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] border border-emerald-500/20 animate-pulse">PROTECTED</span>
                          </h3>

                          {txMessage && (
                            <div className={`p-4 rounded-xl text-xs mb-6 text-center border ${
                              txMessage.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            }`}>
                              {txMessage.text}
                            </div>
                          )}

                          <form onSubmit={handleSendMoney} className="space-y-6">
                            {!isSystemUser && accounts.length > 0 && (
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-3 pl-1">Source Wallet</p>
                                <select 
                                  value={selectedAccount?._id}
                                  onChange={(e) => handleAccountChange(e.target.value)}
                                  className="w-full bg-[#000] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none transition-all cursor-pointer hover:border-white/20"
                                >
                                  {accounts.map(acc => (
                                    <option key={acc._id} value={acc._id}>
                                      WALLET ...{acc._id.slice(-4).toUpperCase()} (₹{acc.balance || '0'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div>
                              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-3 pl-1">Recipient ID</p>
                              <input 
                                type="text" 
                                placeholder="TARGET ACCOUNT ID" 
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                                className="w-full bg-[#000] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-white/30 transition-all"
                              />
                            </div>
                            
                            <div>
                              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-3 pl-1">Value (₹)</p>
                              <input 
                                type="number" 
                                placeholder="0.00" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-[#000] border border-white/10 rounded-xl px-5 py-4 text-xl font-bold text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                              />
                            </div>
                            
                            <button 
                              disabled={txLoading}
                              className="w-full py-5 rounded-2xl bg-white text-black font-['Syne'] font-extrabold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                              {txLoading ? 'Validating...' : (isSystemUser ? 'Dispatch Initial' : 'Authorize Payment')}
                            </button>
                          </form>
                       </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'wallets' && (
                <div className="animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="flex justify-between items-center mb-10 px-2">
                    <h3 className="font-['Syne'] font-bold text-2xl text-white/90">Identity Nodes</h3>
                    <button onClick={handleCreateAccount} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-['Syne'] font-bold tracking-widest text-[10px] hover:bg-white/10 transition-colors uppercase">
                       + Create New Identity
                    </button>
                  </div>
                  
                  {accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                       <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl mb-6 opacity-40">💳</div>
                       <p className="text-white/40 text-sm font-medium">No active identity nodes found in this session.</p>
                       <button onClick={handleCreateAccount} className="mt-8 text-xs font-bold text-white/60 hover:text-white border-b border-white/20 pb-1">Initialize First Node</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {accounts.map(acc => (
                         <div key={acc._id} onClick={() => handleAccountChange(acc._id)} className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-500 cursor-pointer group hover:scale-[1.02] ${
                           selectedAccount?._id === acc._id 
                             ? 'bg-gradient-to-br from-white/10 via-white/[0.05] to-transparent border-white/20' 
                             : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                         }`}>
                           <div className="flex justify-between items-start mb-16">
                             <div className="h-10 w-10 flex items-center justify-center text-white/40 bg-white/5 rounded-xl border border-white/5 group-hover:text-white">
                               VISA
                             </div>
                             {selectedAccount?._id === acc._id && (
                               <span className="text-[10px] font-bold tracking-[3px] text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded inline-block border border-emerald-500/20">PRIMARY</span>
                             )}
                           </div>
                           <p className="text-xs uppercase tracking-[0.3em] font-bold text-white/20 mb-2">Vault Reference</p>
                           <p className="text-2xl font-mono tracking-tighter text-white/80 group-hover:text-white">**** **** **** {acc._id.slice(-4).toUpperCase()}</p>
                           <div className="mt-12 flex justify-between items-end">
                             <div>
                               <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Contract Owner</p>
                               <p className="text-xs font-bold text-white/60 group-hover:text-white/90">{user.name.toUpperCase()}</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Status</p>
                               <p className="text-xs font-bold text-white/60 group-hover:text-white/90 capitalize">Active {acc.currency}</p>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="h-[60vh] flex flex-col items-center justify-center border border-white/5 rounded-[40px] bg-white/[0.01]">
                   <p className="text-white/20 text-xs tracking-[0.5em] font-medium uppercase animate-pulse">Scanning Global Ledger</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
