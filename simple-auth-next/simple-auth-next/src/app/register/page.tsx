'use client';
import React, { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, login, password }),
    });
    if (res.ok) {
      window.location.href = '/login';
    } else {
      const data = await res.json().catch(()=>({ error: 'Erro' }));
      setMsg(data?.error || 'Erro ao registrar');
    }
  }

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #6a00f4, #9b4dff, #7f00ff)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 8px 25px rgba(0,0,0,0.2)', width: 320, textAlign: 'center' }}>
        <form onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: 20, color: '#6a00f4' }}>Criar Conta</h2>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} name="email" placeholder="Email" required style={{ width:'100%', padding:10, margin:'8px 0', border:'1px solid #ddd', borderRadius:8, fontSize:14 }} />
          <input value={login} onChange={(e)=>setLogin(e.target.value)} name="login" placeholder="Login" required style={{ width:'100%', padding:10, margin:'8px 0', border:'1px solid #ddd', borderRadius:8, fontSize:14 }} />
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} name="password" placeholder="Senha" required style={{ width:'100%', padding:10, margin:'8px 0', border:'1px solid #ddd', borderRadius:8, fontSize:14 }} />
          <button type="submit" style={{ width:'100%', padding:10, marginTop:15, background:'#6a00f4', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>Registrar</button>
          <a href="/login" style={{ display:'block', marginTop:15, color:'#6a00f4', textDecoration:'none' }}>Voltar ao Login</a>
          {msg && <p style={{ color: 'red', marginTop: 12 }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
}
