import React from 'react';

export default function MainPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', background: 'linear-gradient(120deg, #6a00f4, #0077ff)', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1>Bem-vindo!</h1>
      <a href="/login" style={{ color: '#fff', marginTop: 10, textDecoration: 'underline' }}>Sair</a>
    </div>
  );
}
