"use client";
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function Home() {
  const [coins, setCoins] = useState(0);
  const [items, setItems] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/coins').then(r => r.json()).then(d => setCoins(d.coins || 0));
    fetch('/api/items').then(r => r.json()).then(d => setItems(d || []));
  }, []);

  const startDraw = async () => {
    if (isDrawing || coins < 1) {
      if (coins < 1) alert("코인이 부족합니다! 애교 부리고 충전을 요구하세요 🥺");
      return;
    }
    
    setIsDrawing(true);
    
    const res = await fetch('/api/draw', { method: 'POST' });
    const data = await res.json();
    
    if (res.ok) {
      setTimeout(() => {
        setResult(data.item);
        setCoins(data.coinsRemaining);
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#ff758c', '#ff7eb3', '#ffdb58', '#fff'] });
        setIsDrawing(false);
      }, 1000);
    } else {
      alert(data.error);
      setIsDrawing(false);
    }
  };

  return (
    <div className="app-container">
      <div className="coin-badge">💰 내 코인: {coins}개</div>
      
      <div className="header">
        <h1>🎁 랜덤 선물 뽑기 🎁</h1>
        <p>코인 1개를 내고 뽑아봐요!</p>
      </div>

      <div className={`gift-box-container ${isDrawing ? 'shake' : ''}`} onClick={startDraw}>
        <div className="gift-box" />
      </div>

      <button className="draw-btn" onClick={startDraw} disabled={isDrawing || coins < 1}>
        {isDrawing ? '두근두근...' : '💖 오늘의 혜택 뽑기! 💖'}
      </button>

      <div className="coupon-list-title">🎁 현재 뽑을 수 있는 상품들 🎁</div>
      <div className="coupon-list-container">
        {items.length === 0 ? <p style={{color:'#7a6b6e', margin:'auto'}}>준비된 상품이 없습니다.</p> : items.map(item => (
          <div key={item.id} className="coupon-item">
            <div className="coupon-item-icon">{item.icon}</div>
            <div className="coupon-item-title">{item.title}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
         <Link href="/suggest" className="action-link">✨ 새 쿠폰 조르기</Link>
         <Link href="/admin" className="action-link" style={{background: 'rgba(0,0,0,0.05)'}}>🔒 관리자 전용</Link>
      </div>

      {result && (
        <div className="modal-overlay" onClick={() => setResult(null)}>
          <div className="coupon-card" onClick={e => e.stopPropagation()}>
            <div className="coupon-icon">{result.icon}</div>
            <h2 className="coupon-title">{result.title}</h2>
            <p className="coupon-desc">{result.description}</p>
            <button className="primary-btn" onClick={() => setResult(null)}>소중하게 킵하기 ✨</button>
          </div>
        </div>
      )}
    </div>
  );
}
