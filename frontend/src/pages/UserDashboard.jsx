import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AbstractLogo from '../components/AbstractLogo';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { fetchUserAccounts, fetchAccountDetails, createAccount, fetchAllUsersAccounts } from '../api/accountService';
import { createTransaction, createInitialTransaction, getAllTransactions, systemWithdrawal } from '../api/transactionService';
import { createAccountRequest, getMyRequests, getAllAccountRequests, reviewAccountRequest } from '../api/accountRequestService';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [txMpin, setTxMpin] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txMessage, setTxMessage] = useState(null);

  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState({ type: '', text: '' });

  const [expandedTx, setExpandedTx] = useState(null);

  const [revealedAccounts, setRevealedAccounts] = useState(new Set());
  const [copiedAccount, setCopiedAccount] = useState(null);

  // Account Requests state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMsg, setRequestMsg] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [reviewAmounts, setReviewAmounts] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});

  const toggleReveal = (e, accId) => {
    e.stopPropagation();
    setRevealedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(accId)) next.delete(accId);
      else next.add(accId);
      return next;
    });
  };

  const copyAccountId = (e, accId) => {
    e.stopPropagation();
    navigator.clipboard.writeText(accId);
    setCopiedAccount(accId);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const isSystemUser = user?.email?.toLowerCase() === import.meta.env.VITE_SYSTEM_EMAIL?.toLowerCase();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadAccounts();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'activity' || activeTab === 'overview' || activeTab === 'wallets') {
      if (isSystemUser && activeTab === 'wallets' && accounts.length === 0) {
        loadAccounts();
      } else if (activeTab === 'activity' || activeTab === 'overview') {
        loadActivities();
      }
    }
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const resp = await getAllTransactions();
      setActivities(resp.transactions || []);
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      if (isSystemUser) {
        const data = await getAllAccountRequests();
        setRequests(data.requests || []);
      } else {
        const data = await getMyRequests();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
      handleApiError(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleReviewRequest = async (requestId, action) => {
    setReviewLoading(prev => ({ ...prev, [requestId]: action }));
    setRequestMsg(null);
    try {
      await reviewAccountRequest(
        requestId,
        action,
        reviewNotes[requestId] || '',
        parseFloat(reviewAmounts[requestId]) || 0
      );
      setRequestMsg({ type: 'success', text: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.` });
      await loadRequests();
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.message || 'Failed to review request.' });
    } finally {
      setReviewLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      if (isSystemUser) {
        const accs = await fetchAllUsersAccounts();
        setAccounts(accs);
        // Sum total balances for overview system user
        const total = accs.reduce((acc, curr) => acc + (curr.balance || 0), 0);
        setBalance(total);
      } else {
        const accs = await fetchUserAccounts();
        setAccounts(accs);
        if (accs.length > 0) {
          if (!selectedAccount) {
            const details = await fetchAccountDetails(accs[0]._id);
            setSelectedAccount(details.account);
            setBalance(details.balance);
          } else {
            const details = await fetchAccountDetails(selectedAccount._id);
            setSelectedAccount(details.account);
            setBalance(details.balance);
          }
        }
      }
    } catch (err) {
      if (!handleApiError(err)) {
        setError('Failed to load accounts. ' + (err.message || ''));
      }
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
      if (!handleApiError(err)) {
        setError('Failed to switch account.');
      }
    }
  };

  const handleCreateAccount = async () => {
    setRequestSubmitting(true);
    setRequestMsg(null);
    try {
      await createAccountRequest();
      setRequestMsg({ type: 'success', text: 'Request submitted! Awaiting system approval.' });
      // Switch to requests tab to show status
      setActiveTab('requests');
    } catch (err) {
      if (!handleApiError(err)) {
        setRequestMsg({ type: 'error', text: err.message || 'Failed to submit request.' });
      }
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleSendMoney = async (e) => {
    e.preventDefault();
    setTxMessage(null);

    if (isSystemUser) {
      if (!toAccount || !amount || parseFloat(amount) <= 0 || !description.trim()) {
        setTxMessage({ type: 'error', text: 'Please provide valid account ID, positive amount, and description.' });
        return;
      }
    } else {
      if (!toAccount || !amount || parseFloat(amount) <= 0 || !description.trim() || !txMpin || txMpin.length !== 4) {
        setTxMessage({ type: 'error', text: 'Please provide valid account ID, positive amount, description, and 4-digit MPIN.' });
        return;
      }
    }

    setTxLoading(true);
    const idempotencyKey = crypto.randomUUID();

    try {
      if (isSystemUser) {
        await createInitialTransaction({
          toAccount,
          amount: parseFloat(amount),
          idempotencyKey,
          description: description.trim()
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
          idempotencyKey,
          description: description.trim(),
          mpin: txMpin
        });
        setTxMessage({ type: 'success', text: 'Transaction sent successfully!' });

        const details = await fetchAccountDetails(selectedAccount._id);
        setBalance(details.balance);
      }

      setToAccount('');
      setAmount('');
      setDescription('');
      setTxMpin('');
    } catch (err) {
      if (!handleApiError(err)) {
        setTxMessage({ type: 'error', text: err.message || 'Transaction failed.' });
      }
    } finally {
      setTxLoading(false);
    }
  };

  const handleSystemWithdraw = async (e, accountId) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      setWithdrawMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }
    setWithdrawLoading(true);
    setWithdrawMessage({ type: '', text: '' });
    try {
      await systemWithdrawal({
        fromAccount: accountId,
        amount: parseFloat(withdrawAmount),
        idempotencyKey: crypto.randomUUID(),
        description: 'System-initiated forced withdrawal'
      });
      setWithdrawMessage({ type: 'success', text: `Successfully withdrew ₹${withdrawAmount}.` });
      await loadAccounts(); 
      setWithdrawAmount('');
      setTimeout(() => setWithdrawTarget(null), 2000); 
    } catch (err) {
      if (!handleApiError(err)) {
        setWithdrawMessage({ type: 'error', text: err.message || 'Withdrawal failed.' });
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleApiError = (err) => {
    const msg = err.message || '';
    if (msg.includes('Session expired') || msg.includes('logged in from another device') || msg.includes('Invalid token') || msg.includes('No token provided')) {
      handleLogout();
      return true;
    }
    return false;
  };

  const { currentMonthSpend, trendPercent } = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let current = 0;
    let past = 0;

    activities.forEach(tx => {
      const txDate = new Date(tx.createdAt);
      if (tx.status === 'completed') {
        const isCredit = Array.isArray(accounts) && accounts.some(acc => tx.toAccount?._id === acc._id) || tx.toAccount?.user?.toString() === user?.id;
        if (!isCredit) {
          if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
            current += (tx.amount || 0);
          } else if (txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear) {
            past += (tx.amount || 0);
          }
        }
      }
    });

    let trend = 0;
    if (past > 0) {
      trend = ((current - past) / past) * 100;
    } else if (current > 0 && past === 0) {
      trend = 100;
    }

    return { 
      currentMonthSpend: current, 
      trendPercent: parseFloat(trend.toFixed(1)) 
    };
  }, [activities, accounts, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col md:flex-row select-none overflow-hidden font-['Inter']">
      
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#030303]/80 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-2">
          <AbstractLogo size={24} />
          <span className="font-['Syne'] font-extrabold text-lg tracking-tight text-white">QuickPay.</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-white/50 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-white/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[250px] h-[250px] bg-white/[0.015] rounded-full blur-[80px]" />

        <div className="absolute top-[20%] right-[30%] w-[200px] h-[200px] bg-purple-500/[0.05] rounded-full blur-[90px]" />
        <div className="absolute bottom-[30%] right-[10%] w-[300px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-[5%] left-[20%] w-[200px] h-[200px] bg-emerald-500/[0.03] rounded-full blur-[80px]" />
      </div>

      <main className="flex-1 ml-0 md:ml-72 h-[calc(100vh-80px)] md:h-screen overflow-y-auto custom-scrollbar relative z-10 bg-transparent mt-[80px] md:mt-0">
        <div className="max-w-6xl mx-auto p-5 md:p-10 pb-24">

          <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-12">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium mb-2 font-['Syne']">QuickPay Platform v1.0</p>
              <h1 className="text-4xl font-extrabold tracking-tight font-['Syne'] text-white/90">
                {activeTab === 'overview' ? `Welcome, ${user.name.split(' ')[0]}` : activeTab === 'requests' ? 'User Requests' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            <div className="text-left md:text-right">
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
                      value={currentMonthSpend.toLocaleString('en-IN')} 
                      suffix="₹"
                      trend={trendPercent}
                      icon="📉"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                      {/* Create Another Account Prompt */}
                      {!isSystemUser && (
                         <div className="p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-white/20 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden relative cursor-default">
                           <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 group-hover:scale-150 transition-all duration-700 ease-out" />
                           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 group-hover:scale-150 transition-all duration-700 ease-out" />
                           <div className="relative z-10">
                             <h3 className="font-['Syne'] font-bold text-white/90 text-lg mb-1 group-hover:text-white transition-colors">Expand Your Accounts</h3>
                             <p className="text-white/40 text-xs group-hover:text-white/60 transition-colors">Create another account to separate your finances or scale operations.</p>
                           </div>
                           <button 
                             onClick={handleCreateAccount}
                             disabled={requestSubmitting}
                             className="relative z-10 flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-white text-black font-['Syne'] font-extrabold uppercase tracking-widest text-[11px] transition-all hover:scale-[1.05] hover:-translate-y-1 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-gradient-to-r hover:from-white hover:to-gray-200 w-full md:w-auto justify-center disabled:opacity-50"
                           >
                             <span>+</span> {requestSubmitting ? 'Submitting...' : 'Request Another Account'}
                           </button>
                         </div>
                       )}

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
                          {loadingActivities ? (
                            <div className="text-center text-white/30 text-xs py-10 animate-pulse uppercase tracking-widest font-mono">Fetching latest operations...</div>
                          ) : activities.length === 0 ? (
                            <div className="text-center text-white/30 text-xs py-10 border border-white/5 rounded-2xl bg-white/[0.01]">No operations found.</div>
                          ) : (
                            activities.slice(0, 5).map((tx, idx) => {
                              const isCredit = Array.isArray(accounts) && accounts.some(acc => tx.toAccount?._id === acc._id) || tx.toAccount?.user?.toString() === user.id;
                              return (
                                <div key={tx._id || idx} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                   <div className="flex items-center gap-4">
                                     <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl ${isCredit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                       {isCredit ? '↓' : '↑'}
                                     </div>
                                     <div>
                                       <p className="text-sm font-semibold text-white/90">
                                         {isCredit ? `From ${tx.fromAccount?.user?.name || (tx.fromAccount?._id ? '...' + tx.fromAccount._id.slice(-4).toUpperCase() : 'System')}` : `To ${tx.toAccount?.user?.name || (tx.toAccount?._id ? '...' + tx.toAccount._id.slice(-4).toUpperCase() : 'Unknown')}`}
                                       </p>
                                       <p className="text-[10px] uppercase tracking-widest text-white/30 truncate max-w-[200px]">{tx.description ? `${tx.description} • ` : ''}{new Date(tx.createdAt).toLocaleDateString()}</p>
                                     </div>
                                   </div>
                                   <div className="text-right">
                                     <p className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : 'text-white/90'}`}>
                                       {isCredit ? '+' : '-'} ₹{tx.amount?.toLocaleString('en-IN') || '0.00'}
                                     </p>
                                     <p className={`text-[9px] uppercase font-bold tracking-tighter px-1.5 py-0.5 rounded inline-block mt-1 ${
                                       tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                                       tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                     }`}>{tx.status || 'Success'}</p>
                                   </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="p-6 md:p-8 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl md:sticky md:top-10">
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

                            <div>
                              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-3 pl-1">Description</p>
                              <input 
                                type="text" 
                                placeholder="What is this for?" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#000] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                              />
                            </div>

                            {!isSystemUser && (
                              <div>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold mb-3 pl-1">Transaction MPIN</p>
                                <input 
                                  type="password" 
                                  maxLength="4"
                                  placeholder="••••" 
                                  value={txMpin}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 4) setTxMpin(val);
                                  }}
                                  className="w-full bg-[#000] border border-white/10 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                                />
                              </div>
                            )}

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
                    <h3 className="font-['Syne'] font-bold text-2xl text-white/90">{isSystemUser ? "User Directory" : "Your Accounts"}</h3>
                    {!isSystemUser && (
                      <button onClick={handleCreateAccount} disabled={requestSubmitting} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-['Syne'] font-bold tracking-widest text-[10px] hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all uppercase flex items-center gap-2 disabled:opacity-50">
                         <span className="text-lg leading-none">+</span> {requestSubmitting ? 'Submitting...' : 'Request Another Account'}
                      </button>
                    )}
                  </div>

                  {accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                       <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl mb-6 opacity-40">💳</div>
                       <p className="text-white/40 text-sm font-medium">{isSystemUser ? "No users found in the system." : "No accounts found in this profile."}</p>
                       {!isSystemUser && <button onClick={handleCreateAccount} disabled={requestSubmitting} className="mt-8 text-xs font-bold text-white/60 hover:text-white border-b border-white/20 hover:border-white pb-1 transition-all disabled:opacity-50">{requestSubmitting ? 'Submitting...' : 'Request First Account'}</button>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {accounts.map(acc => (
                         <div key={acc._id} onClick={() => !isSystemUser && handleAccountChange(acc._id)} className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-500 group ${!isSystemUser ? 'cursor-pointer hover:scale-[1.02]' : ''} ${
                           selectedAccount?._id === acc._id && !isSystemUser
                             ? 'bg-gradient-to-br from-white/10 via-white/[0.05] to-transparent border-white/20' 
                             : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                         }`}>
                           <div className="flex justify-between items-start mb-16">
                             <div className="h-10 w-10 flex items-center justify-center text-white/40 bg-white/5 rounded-xl border border-white/5 group-hover:text-white">
                               {isSystemUser ? '👤' : 'VISA'}
                             </div>
                             {selectedAccount?._id === acc._id && !isSystemUser && (
                               <span className="text-[10px] font-bold tracking-[3px] text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded inline-block border border-emerald-500/20">PRIMARY</span>
                             )}
                             {isSystemUser && (
                               <div className="flex flex-col items-end">
                                 <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Balance</span>
                                 <span className="text-xl font-mono text-white/90">₹{acc.balance?.toLocaleString('en-IN') || '0.00'}</span>
                               </div>
                             )}
                           </div>
                           <p className="text-xs uppercase tracking-[0.3em] font-bold text-white/20 mb-2">{isSystemUser ? "Account ID" : "Vault Reference"}</p>
                           <div className="flex items-center gap-3">
                             <p className="text-2xl font-mono tracking-tighter text-white/80 group-hover:text-white truncate">
                               {isSystemUser ? acc._id : (revealedAccounts.has(acc._id) ? acc._id : `**** **** **** ${acc._id.slice(-4).toUpperCase()}`)}
                             </p>
                             {!isSystemUser && (
                               <button
                                 onClick={(e) => toggleReveal(e, acc._id)}
                                 className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90"
                                 title={revealedAccounts.has(acc._id) ? 'Hide ID' : 'Show ID'}
                               >
                                 {revealedAccounts.has(acc._id) ? (
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                 ) : (
                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                 )}
                               </button>
                             )}
                             <button
                               onClick={(e) => copyAccountId(e, acc._id)}
                               className={`p-2 rounded-lg border transition-all active:scale-90 flex-shrink-0 ${
                                 copiedAccount === acc._id
                                   ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                   : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20'
                               }`}
                               title="Copy Account ID"
                             >
                               {copiedAccount === acc._id ? (
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                               ) : (
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                               )}
                             </button>
                           </div>
                           <div className="mt-12 flex justify-between items-end">
                             <div className="overflow-hidden">
                               <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{isSystemUser ? "User Details" : "Contract Owner"}</p>
                               <p className="text-xs font-bold text-white/60 group-hover:text-white/90 truncate mr-4">
                                 {isSystemUser ? `${acc.user?.name} (${acc.user?.email})` : user.name.toUpperCase()}
                               </p>
                             </div>
                             <div className="text-right flex-shrink-0">
                               <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Status</p>
                               <p className="text-xs font-bold text-white/60 group-hover:text-white/90 capitalize">Active {acc.currency}</p>
                             </div>
                           </div>
                           
                           {isSystemUser && (
                             <div className="mt-6 pt-6 border-t border-white/5">
                               {withdrawTarget !== acc._id ? (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setWithdrawTarget(acc._id);
                                     setWithdrawMessage({ type: '', text: '' });
                                   }}
                                   className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500/20 transition-colors"
                                 >
                                   Force Withdraw
                                 </button>
                               ) : (
                                 <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                   <input
                                     type="number"
                                     value={withdrawAmount}
                                     onChange={(e) => setWithdrawAmount(e.target.value)}
                                     placeholder="Amount in INR"
                                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-rose-500 transition-colors"
                                   />
                                   {withdrawMessage.text && (
                                     <p className={`text-[10px] font-bold ${withdrawMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                       {withdrawMessage.text}
                                     </p>
                                   )}
                                   <div className="flex gap-2">
                                     <button
                                       onClick={() => setWithdrawTarget(null)}
                                       className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                     >
                                       Cancel
                                     </button>
                                     <button
                                       onClick={(e) => handleSystemWithdraw(e, acc._id)}
                                       disabled={withdrawLoading}
                                       className="flex-1 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                                     >
                                       {withdrawLoading ? 'Processing...' : 'Confirm'}
                                     </button>
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="flex justify-between items-center mb-10 px-2">
                    <h3 className="font-['Syne'] font-bold text-2xl text-white/90">Global Ledger</h3>
                    <button onClick={loadActivities} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-['Syne'] font-bold tracking-widest text-[10px] hover:bg-white/10 transition-colors uppercase">
                       Refresh Ledger
                    </button>
                  </div>

                  {loadingActivities ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                       <p className="text-white/20 text-xs tracking-[0.5em] font-medium uppercase animate-pulse">Scanning Synchronized Transactions</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                       <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl mb-6 opacity-40">🧾</div>
                       <p className="text-white/40 text-sm font-medium">No transactions found in the global ledger.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       {activities.map((tx, idx) => {
                         const isCredit = Array.isArray(accounts) && accounts.some(acc => tx.toAccount?._id === acc._id) || tx.toAccount?.user?.toString() === user.id;
                         const isExpanded = expandedTx === tx._id;
                         return (
                           <div key={tx._id || idx} className="flex flex-col p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setExpandedTx(isExpanded ? null : tx._id)}>
                              <div className="flex items-start md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                                  <div className={`h-10 w-10 md:h-14 md:w-14 flex-shrink-0 rounded-2xl flex items-center justify-center font-bold text-xl md:text-2xl ${isCredit ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'} group-hover:scale-105 transition-transform`}>
                                    {isCredit ? '↓' : '↑'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white/90 mb-1 truncate">
                                      {isCredit 
                                        ? `Received from ${tx.fromAccount?.user?.name || (tx.fromAccount?._id ? '...' + tx.fromAccount._id.slice(-4).toUpperCase() : 'System')}` 
                                        : `Sent to ${tx.toAccount?.user?.name || (tx.toAccount?._id ? '...' + tx.toAccount._id.slice(-4).toUpperCase() : 'Unknown')}`}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 truncate">
                                      {tx.description ? `${tx.description} • ` : ''}{new Date(tx.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className={`text-base md:text-lg font-bold ${isCredit ? 'text-emerald-400' : 'text-white/90'}`}>
                                    {isCredit ? '+' : '-'} ₹{tx.amount?.toLocaleString('en-IN') || '0.00'}
                                  </p>
                                  <p className={`text-[9px] uppercase font-bold tracking-tighter px-2 py-1 rounded mt-1 inline-block ${
                                    tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                    tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {tx.status || 'Success'}
                                  </p>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300 cursor-default" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-['Syne'] font-bold text-lg text-white/90">Transaction Receipt</h4>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/40 tracking-widest uppercase truncate max-w-[150px]">ID: {tx._id.slice(-8).toUpperCase()}</span>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#000]/30 p-6 rounded-2xl border border-white/5">

                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2">Status</p>
                                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${tx.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : tx.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                            <span className="relative flex h-2 w-2">
                                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${tx.status === 'completed' ? 'bg-emerald-400' : tx.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                                              <span className={`relative inline-flex rounded-full h-2 w-2 ${tx.status === 'completed' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                            </span>
                                            <span className="text-[11px] font-bold tracking-wider uppercase">{tx.status ? tx.status : 'UNKNOWN'}</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2">Date & Time</p>
                                          <p className="text-[13px] text-white/80 font-mono mt-1 pr-1">{new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2">Description</p>
                                        <p className="text-sm text-white/70 italic border-l-2 border-white/10 pl-3 leading-relaxed">{tx.description || 'No description provided.'}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 flex items-center justify-between group-hover:border-white/20 transition-colors">
                                        <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Sender</p>
                                          <p className="text-sm font-bold text-white/90 mb-1">{tx.fromAccount?.user?.name || 'System'}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-mono text-white/30 mt-4 truncate max-w-[120px]">{tx.fromAccount?._id || 'SYSTEM_DEFAULT'}</p>
                                        </div>
                                      </div>

                                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 flex items-center justify-between group-hover:border-white/20 transition-colors">
                                        <div>
                                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-1">Receiver</p>
                                          <p className="text-sm font-bold text-white/90 mb-1">{tx.toAccount?.user?.name || 'Unknown'}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[10px] font-mono text-white/30 mt-4 truncate max-w-[120px]">{tx.toAccount?._id || 'UNKNOWN_ACCOUNT'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-6 text-center">
                                     <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Ref: {tx.idempotencyKey || 'N/A'}</p>
                                  </div>
                                </div>
                              )}
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="flex justify-between items-center mb-10 px-2">
                    <h3 className="font-['Syne'] font-bold text-2xl text-white/90">
                      {isSystemUser ? 'Pending Account Requests' : 'My Account Requests'}
                    </h3>
                    <button onClick={loadRequests} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-['Syne'] font-bold tracking-widest text-[10px] hover:bg-white/10 transition-colors uppercase">
                      Refresh
                    </button>
                  </div>

                  {requestMsg && (
                    <div className={`p-4 rounded-xl text-xs mb-6 text-center border ${
                      requestMsg.type === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {requestMsg.text}
                    </div>
                  )}

                  {requestsLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                      <p className="text-white/20 text-xs tracking-[0.5em] font-medium uppercase animate-pulse">Loading Requests...</p>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-[40px] bg-white/[0.01]">
                      <div className="h-16 w-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl mb-6 opacity-40">📋</div>
                      <p className="text-white/40 text-sm font-medium">
                        {isSystemUser ? 'No pending requests at this time.' : 'You have not submitted any account requests.'}
                      </p>
                      {!isSystemUser && (
                        <button
                          onClick={handleCreateAccount}
                          disabled={requestSubmitting}
                          className="mt-8 px-6 py-3 rounded-xl bg-white text-black font-['Syne'] font-extrabold uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {requestSubmitting ? 'Submitting...' : '+ Request New Account'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((req) => {
                        const statusColor =
                          req.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          req.status === 'rejected' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                          'text-amber-400 bg-amber-500/10 border-amber-500/20';

                        return (
                          <div key={req._id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-2xl space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                {isSystemUser && (
                                  <p className="text-sm font-bold text-white/90">
                                    {req.user?.name} <span className="text-white/30 font-normal">({req.user?.email})</span>
                                  </p>
                                )}
                                <p className="text-[10px] uppercase tracking-widest text-white/30">
                                  Requested on {new Date(req.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <span className={`self-start md:self-auto px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${statusColor}`}>
                                {req.status}
                              </span>
                            </div>

                            {req.reviewNote && (
                              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Review Note</p>
                                <p className="text-sm text-white/70 italic">{req.reviewNote}</p>
                              </div>
                            )}

                            {isSystemUser && req.status === 'pending' && (
                              <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2 pl-1">Review Note (optional)</p>
                                    <input
                                      type="text"
                                      placeholder="Add a note for the user..."
                                      value={reviewNotes[req._id] || ''}
                                      onChange={e => setReviewNotes(prev => ({ ...prev, [req._id]: e.target.value }))}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 mb-2 pl-1">Initial Deposit ₹ (optional)</p>
                                    <input
                                      type="number"
                                      placeholder="0.00"
                                      value={reviewAmounts[req._id] || ''}
                                      onChange={e => setReviewAmounts(prev => ({ ...prev, [req._id]: e.target.value }))}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleReviewRequest(req._id, 'approve')}
                                    disabled={!!reviewLoading[req._id]}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                  >
                                    {reviewLoading[req._id] === 'approve' ? 'Processing...' : '✓ Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleReviewRequest(req._id, 'reject')}
                                    disabled={!!reviewLoading[req._id]}
                                    className="flex-1 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                                  >
                                    {reviewLoading[req._id] === 'reject' ? 'Processing...' : '✗ Reject'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!isSystemUser && requests.length > 0 && requests.every(r => r.status !== 'pending') && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={handleCreateAccount}
                        disabled={requestSubmitting}
                        className="px-8 py-4 rounded-2xl bg-white text-black font-['Syne'] font-extrabold uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {requestSubmitting ? 'Submitting...' : '+ Request Another Account'}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
