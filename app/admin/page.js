"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    // Simple lock
    const pw = prompt("관리자 비밀번호를 입력하세요");
    if (pw === '1234') { // hardcoded for simple use
      setAuth(true);
      fetchData();
    } else {
      alert("접근 거부! 여친 접근 금지 ❌");
      window.location.href = '/';
    }
  }, []);

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
      fetchData(); // refresh
    }
  };

  if (!auth) return <div style={{padding:'20px'}}>인증 중...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{color:'#ff758c', borderBottom:'2px solid #ffccd5', paddingBottom:'10px'}}>👑 전용 관리자</h1>
      
      <section style={{margin:'20px 0', background:'#fff', padding:'20px', borderRadius:'15px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        <h2>💰 여친 코인 뱅크</h2>
        <p>현재 보유량: <strong style={{fontSize:'1.5rem', color:'#ff758c'}}>{coins}</strong> 코인</p>
        <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
          <button onClick={() => addCoin(1)} style={{padding:'10px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>이쁜짓! 코인 +1 지급</button>
          <button onClick={() => addCoin(-1)} style={{padding:'10px', background:'#dc3545', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>코인 -1 차감</button>
        </div>
      </section>

      <section style={{margin:'20px 0', background:'#fff', padding:'20px', borderRadius:'15px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        <h2>📝 조르기 승인 대기열</h2>
        {pending.length === 0 ? <p style={{color:'#666'}}>새로 조르기 한 항목이 없습니다.</p> : pending.map(item => (
          <div key={item.id} style={{border:'2px dashed #ffccd5', padding:'15px', borderRadius:'10px', margin:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <span style={{fontSize:'2.5rem'}}>{item.icon}</span>
              <strong style={{marginLeft:'10px', fontSize:'1.2rem', color:'#ff758c'}}>{item.title}</strong>
              <div style={{color:'#666', marginTop:'5px', marginLeft:'10px'}}>{item.description}</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <button onClick={() => handleApprove(item.id, 'APPROVE')} style={{padding:'8px 20px', background:'#ff7eb3', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>수락</button>
              <button onClick={() => handleApprove(item.id, 'REJECT')} style={{padding:'8px 20px', background:'#999', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>기각</button>
            </div>
          </div>
        ))}
      </section>

      <section style={{margin:'20px 0', background:'#fff', padding:'20px', borderRadius:'15px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)'}}>
        <h2>🕵️ 여친 당첨 감시(?) 기록</h2>
        {history.length === 0 ? <p style={{color:'#666'}}>아직 뽑기 기록이 없습니다.</p> : history.map(h => (
          <div key={h.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', alignItems:'center'}}>
            <span style={{fontSize:'1.5rem'}}>{h.item.icon}</span> 
            <strong style={{marginLeft:'10px'}}>{h.item.title}</strong>
            <span style={{color:'#aaa', marginLeft:'10px', fontSize:'0.9rem'}}>({new Date(h.drawnAt).toLocaleString()})</span>
          </div>
        ))}
      </section>

      <div style={{textAlign:'center', marginTop:'30px'}}>
        <Link href="/" style={{color:'#ff758c', textDecoration:'none', fontWeight:'bold', display:'inline-block'}}>← 로비로 도망가기</Link>
      </div>
    </div>
  );
}
