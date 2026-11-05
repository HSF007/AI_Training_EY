import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Plus, Search, Send, PanelLeftClose, PanelLeftOpen, Sparkles, Trash2, Check, X, Library, MessageSquare, Moon, Sun } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_KEY = 'library-ai-conversations-v1';
const makeChat = () => ({ id: crypto.randomUUID(), title: 'New chat', messages: [], updatedAt: Date.now() });

export default function App() {
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [makeChat()]; }
    catch { return [makeChat()]; }
  });
  const [activeId, setActiveId] = useState(() => chats[0]?.id);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [filter, setFilter] = useState('');
  const endRef = useRef(null);
  const active = chats.find(c => c.id === activeId) || chats[0];

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); }, [chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages, busy]);

  const updateActive = (fn) => setChats(prev => prev.map(c => c.id === activeId ? fn(c) : c));
  const newChat = () => {
    const c = makeChat(); setChats(prev => [c, ...prev]); setActiveId(c.id); setInput('');
  };
  const removeChat = (id, e) => {
    e.stopPropagation();
    setChats(prev => {
      const next = prev.filter(c => c.id !== id);
      if (!next.length) next.push(makeChat());
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };
  async function request(path, body) {
    const res = await fetch(`${API}${path}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Request failed');
    return data;
  }
  const sendMessage = async (text = input) => {
    const value = text.trim(); if (!value || busy) return;
    setInput('');
    updateActive(c => ({ ...c, title: c.messages.length ? c.title : value.slice(0, 32), updatedAt: Date.now(), messages: [...c.messages, { role:'user', content:value }] }));
    setBusy(true);
    try {
      const data = await request('/api/chat', { conversation_id: activeId, message:value });
      updateActive(c => ({...c, messages:[...c.messages, {role:'assistant', content:data.reply, pending:data.pending_reservation || null}]}));
    } catch (err) {
      updateActive(c => ({...c, messages:[...c.messages, {role:'error', content:err.message}]}));
    } finally { setBusy(false); }
  };
  const confirm = async (approved, messageIndex) => {
    if (busy) return; setBusy(true);
    updateActive(c => ({...c, messages:c.messages.map((m,i) => i === messageIndex ? {...m, pending:null, resolving:true} : m)}));
    try {
      const data = await request('/api/confirm-reservation', {conversation_id:activeId, approved});
      updateActive(c => ({...c, messages:[...c.messages, {role:'assistant', content:data.reply}]}));
    } catch (err) {
      updateActive(c => ({...c, messages:[...c.messages, {role:'error', content:err.message}]}));
    } finally { setBusy(false); }
  };
  const visibleChats = chats.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));
  return <div className={`app ${dark ? 'dark' : 'light'}`}>
    <aside className={`sidebar ${collapsed ? 'closed' : ''}`}>
      <div className="brand"><div className="brand-icon"><Library size={19}/></div><span>Libra<span className="brand-accent">AI</span></span><button className="icon-btn collapse" onClick={()=>setCollapsed(true)} title="Collapse sidebar"><PanelLeftClose size={18}/></button></div>
      <button className="new-chat" onClick={newChat}><Plus size={17}/> New chat</button>
      <div className="side-search"><Search size={15}/><input placeholder="Search chats" value={filter} onChange={e=>setFilter(e.target.value)}/></div>
      <div className="side-label">YOUR CHATS</div>
      <div className="chat-list">{visibleChats.map(c=><div key={c.id} className={`chat-item ${c.id===activeId?'selected':''}`} onClick={()=>setActiveId(c.id)}><MessageSquare size={15}/><span>{c.title}</span><button className="delete-chat" onClick={e=>removeChat(c.id,e)} title="Delete chat"><Trash2 size={14}/></button></div>)}</div>
      <div className="sidebar-bottom"><div className="profile"><div className="avatar">L</div><div><strong>Library Assistant</strong><small>Personal workspace</small></div><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={16}/>:<Moon size={16}/>}</button></div></div>
    </aside>
    <main className="main">
      <header className="topbar">{collapsed && <button className="icon-btn" onClick={()=>setCollapsed(false)}><PanelLeftOpen size={19}/></button>}<div className="top-title"><BookOpen size={17}/><span>Library Assistant</span><span className="status-dot"/></div><div className="top-right"><span className="model-tag"><Sparkles size={13}/> AI-powered</span></div></header>
      <section className="conversation">
        {!active?.messages.length ? <div className="welcome"><div className="welcome-mark"><BookOpen size={30}/><Sparkles size={15}/></div><p className="eyebrow">YOUR PERSONAL LIBRARY COMPANION</p><h1>What can I help you<br/><em>discover today?</em></h1><p className="welcome-sub">Search the library, explore books, or reserve your next read.</p><div className="suggestions">
          <button onClick={()=>sendMessage('Find books about productivity')}><Search size={17}/><span><b>Find a book</b><small>Explore titles by topic or author</small></span></button>
          <button onClick={()=>sendMessage('Show me books about programming')}><BookOpen size={17}/><span><b>Explore a category</b><small>Discover something new to read</small></span></button>
          <button onClick={()=>sendMessage('How do I reserve a book?')}><Sparkles size={17}/><span><b>How reservations work</b><small>Get help with borrowing a book</small></span></button>
        </div></div> : <div className="messages">{active.messages.map((m,i)=><div className={`message-row ${m.role}`} key={i}><div className="message-avatar">{m.role==='assistant'?<Sparkles size={16}/>:m.role==='user'?'Y':<X size={16}/>}</div><div className="message-content"><div className="message-author">{m.role==='user'?'You':m.role==='assistant'?'Libra AI':'Notice'}</div><div className="message-text">{m.content}</div>{m.pending && <div className="reservation-card"><div className="reservation-head"><BookOpen size={17}/><b>Confirm book reservation</b></div><div className="reservation-detail"><span>Book ID</span><strong>{m.pending.book_id}</strong></div><div className="reservation-detail"><span>Customer</span><strong>{m.pending.customer_name}</strong></div><p>This will reserve one available copy. Continue?</p><div className="reservation-actions"><button className="approve" disabled={busy} onClick={()=>confirm(true,i)}><Check size={15}/> Confirm reservation</button><button className="decline" disabled={busy} onClick={()=>confirm(false,i)}><X size={15}/> Cancel</button></div></div>}</div></div>)}
          {busy && <div className="message-row assistant"><div className="message-avatar"><Sparkles size={16}/></div><div className="message-content"><div className="message-author">Libra AI</div><div className="typing"><i/><i/><i/></div></div></div>}
          <div ref={endRef}/></div>}
      </section>
      <footer className="composer-wrap"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Message Libra AI..." rows={1}/><button className="send-btn" disabled={!input.trim()||busy} onClick={()=>sendMessage()}><Send size={17}/></button></div><div className="composer-note">AI can make mistakes. Verify book details before reserving. <span>Enter to send · Shift + Enter for new line</span></div></footer>
    </main>
  </div>;
}
