"use client";
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import styles from './page.module.css';
import { MESSAGES } from '../lib/messages';

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
      if (coins < 1) alert(MESSAGES.DRAW.NOT_ENOUGH_COINS);
      return;
    }
    
    setIsDrawing(true);
    
    const res = await fetch('/api/draw', { method: 'POST' });
    const data = await res.json();
    
    if (res.ok) {
      setTimeout(() => {
        setResult(data.item);
        setCoins(data.coinsRemaining);
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#ff758c', '#ff7eb3', '#a855f7', '#fbbf24', '#fff'] });
        setIsDrawing(false);
      }, 1200);
    } else {
      alert(data.error);
      setIsDrawing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.coinBadge}>✨ 내 코인: {coins}개</div>
      
      <div className={styles.header}>
        <h1>🎁 랜덤 선물 뽑기 🎁</h1>
        <p>코인 1개를 내고 뽑아봐요!</p>
      </div>

      <div className={`${styles.giftBoxContainer} ${isDrawing ? styles.shake : ''}`} onClick={startDraw}>
        <div className={styles.giftBox} />
      </div>

      <button className={styles.drawBtn} onClick={startDraw} disabled={isDrawing || coins < 1}>
        {isDrawing ? MESSAGES.DRAW.DRAWING : MESSAGES.DRAW.BUTTON_IDLE}
      </button>

      <div className={styles.couponListTitle}>🎁 현재 뽑을 수 있는 상품들 🎁</div>
      <div className={styles.couponListContainer}>
        {items.length === 0 ? <p className={styles.emptyText}>{MESSAGES.DRAW.EMPTY_ITEMS}</p> : items.map(item => (
          <div key={item.id} className={styles.couponItem}>
            <div className={styles.couponItemIcon}>{item.icon}</div>
            <div className={styles.couponItemTitle}>{item.title}</div>
          </div>
        ))}
      </div>

      <div className={styles.linksContainer}>
         <Link href="/suggest" className={styles.actionLink}>✨ 새 쿠폰 조르기</Link>
         <Link href="/admin" className={styles.actionLink}>🔒 관리자 전용</Link>
      </div>

      {result && (
        <div className={styles.modalOverlay} onClick={() => setResult(null)}>
          <div className={styles.couponCard} onClick={e => e.stopPropagation()}>
            <div className={styles.couponIcon}>{result.icon}</div>
            <h2 className={styles.couponTitle}>{result.title}</h2>
            <p className={styles.couponDesc}>{result.description}</p>
            <button className={styles.primaryBtn} onClick={() => setResult(null)}>{MESSAGES.DRAW.KEEP_BUTTON}</button>
          </div>
        </div>
      )}
    </div>
  );
}

