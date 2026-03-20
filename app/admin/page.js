"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [coins, setCoins] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setAuth(true);
      fetchData();
    } else {
      alert("접근 거부! 이리 접근 금지 ❌");
      window.location.href = '/';
    }
  };

  const fetchData = async () => {
    fetch('/api/coins').then(r => r.json()).then(d => setCoins(d.coins));
    fetch('/api/admin/pending').then(r => r.json()).then(d => setPending(d));
    fetch('/api/admin/history').then(r => r.json()).then(d => setHistory(d));
  };

  const addCoin = async (amount) => {
    const res = await fetch('/api/coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    if (res.ok) {
      const data = await res.json();
      setCoins(data.coins);
    }
  };

  const handleApprove = async (id, action) => {
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    });
    if (res.ok) {
      alert(`처리 완료 (${action})`);
      fetchData();
    }
  };

  if (!auth) {
    return (
      <div className="login-card glass-card">
        <h2>🔒 관리자 접속</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            value={passwordInput} 
            onChange={e => setPasswordInput(e.target.value)} 
            placeholder="비밀번호를 입력하세요"
            autoFocus
          />
          <button type="submit">접속하기</button>
        </form>
        <div style={{ marginTop: '20px' }}>
          <Link href="/" className="back-link">← 로비로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">👑 전용 관리자</h1>
      
      <section className="admin-section">
        <div className="glass-card">
          <h2>💰 코인 뱅크</h2>
          <p>현재 보유량: <strong className="coin-display">{coins}</strong> 코인</p>
          <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
            <button onClick={() => addCoin(1)} className="admin-btn admin-btn-green">이쁜짓! 코인 +1 지급</button>
            <button onClick={() => addCoin(-1)} className="admin-btn admin-btn-red">코인 -1 차감</button>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <div className="glass-card">
          <h2>📝 승인 대기열</h2>
          {pending.length === 0 ? <p style={{color:'var(--text-muted)'}}>새로 조르기 한 항목이 없습니다.</p> : pending.map(item => (
            <div key={item.id} className="admin-pending-item">
              <div>
                <span style={{fontSize:'2.5rem'}}>{item.icon}</span>
                <strong style={{marginLeft:'10px', fontSize:'1.2rem'}} className="text-gradient">{item.title}</strong>
                <div style={{color:'var(--text-muted)', marginTop:'5px', marginLeft:'10px'}}>{item.description}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                <button onClick={() => handleApprove(item.id, 'APPROVE')} className="admin-btn admin-btn-pink">수락</button>
                <button onClick={() => handleApprove(item.id, 'REJECT')} className="admin-btn admin-btn-gray">기각</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="glass-card">
          <h2>🕵️ 이리 당첨 기록</h2>
          {history.length === 0 ? <p style={{color:'var(--text-muted)'}}>아직 뽑기 기록이 없습니다.</p> : history.map(h => (
            <div key={h.id} className="admin-history-item">
              <span style={{fontSize:'1.5rem'}}>{h.item.icon}</span> 
              <strong style={{marginLeft:'10px'}}>{h.item.title}</strong>
              <span style={{color:'var(--text-muted)', marginLeft:'10px', fontSize:'0.9rem'}}>({new Date(h.drawnAt).toLocaleString()})</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{textAlign:'center', marginTop:'30px'}}>
        <Link href="/" className="back-link">← Home</Link>
      </div>
    </div>
  );
}
