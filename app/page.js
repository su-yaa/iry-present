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
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);

  const renderIcon = (iconStr, type) => {
    if (iconStr && iconStr.startsWith('data:image')) {
      let size = type === 'roulette' ? '50px' : type === 'modal' ? '100px' : '45px';
      return <img src={iconStr} alt="icon" style={{ display: 'block', width: size, height: size, objectFit: 'cover', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', margin: '0 auto' }} />;
    }
    return iconStr;
  };

  useEffect(() => {
    fetch('/api/coins').then(r => r.json()).then(d => setCoins(d.coins || 0));
    fetch('/api/items').then(r => r.json()).then(d => setItems(d || []));
  }, []);

  const startDraw = async () => {
    if (isDrawing || coins < 1) {
      if (coins < 1) alert(MESSAGES.DRAW.NOT_ENOUGH_COINS);
      return;
    }
    if (items.length === 0) {
      alert(MESSAGES.DRAW.EMPTY_ITEMS);
      return;
    }

    setIsDrawing(true);
    setRouletteRotation(0);
    setShowRoulette(true);

    const res = await fetch('/api/draw', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      const winIndex = items.findIndex(item => item.id === data.item.id);
      const anglePerItem = 360 / items.length;
      const targetAngle = 360 * 5 + 360 - (winIndex * anglePerItem + anglePerItem / 2);

      setTimeout(() => {
        setRouletteRotation(targetAngle);
      }, 50);

      setTimeout(() => {
        setResult(data.item);
        setCoins(data.coinsRemaining);
        setShowRoulette(false);
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#ff758c', '#ff7eb3', '#a855f7', '#fbbf24', '#fff'] });
        setIsDrawing(false);
      }, 4000);
    } else {
      setShowRoulette(false);
      alert(data.error);
      setIsDrawing(false);
    }
  };

  const rouletteColors = ['#ff758c', '#a855f7', '#fbbf24', '#ff7eb3', '#38bdf8', '#4ade80', '#f43f5e', '#10b981'];
  const conicGradientStr = items.length > 0 ? items.map((_, i) => {
    const angle = 360 / items.length;
    const color = rouletteColors[i % rouletteColors.length];
    return `${color} ${i * angle}deg ${(i + 1) * angle}deg`;
  }).join(', ') : 'transparent';

  return (
    <div className={styles.container}>
      <div className={styles.coinBadge}>✨ 내 코인: {coins}개</div>

      <div className={styles.header}>
        <h1>🎁 랜덤 선물 뽑기 🎁</h1>
        <p>코인 1개를 내고 뽑아봐요!</p>
      </div>

      <div className={styles.giftBoxContainer} onClick={startDraw}>
        <div className={styles.giftBox} />
      </div>

      <button className={styles.drawBtn} onClick={startDraw} disabled={isDrawing || coins < 1}>
        {isDrawing ? MESSAGES.DRAW.DRAWING : MESSAGES.DRAW.BUTTON_IDLE}
      </button>

      <div className={styles.couponListTitle}>🎁 현재 뽑을 수 있는 상품들 🎁</div>
      <div className={styles.couponListContainer}>
        {items.filter(item => item.title !== '꽝').length === 0 ? <p className={styles.emptyText}>{MESSAGES.DRAW.EMPTY_ITEMS}</p> : items.filter(item => item.title !== '꽝').map(item => (
          <div key={item.id} className={styles.couponItem}>
            <div className={styles.couponItemIcon}>{renderIcon(item.icon, 'list')}</div>
            <div className={styles.couponItemTitle}>{item.title}</div>
          </div>
        ))}
      </div>

      <div className={styles.linksContainer}>
        <Link href="/suggest" className={styles.actionLink}>✨ 새 선물 조르기</Link>
        <Link href="/admin" className={styles.actionLink}>🔒 한수 전용</Link>
      </div>

      {showRoulette && (
        <div className={styles.rouletteOverlay}>
          <h2 className={styles.rouletteOverlayTitle}>
            {isDrawing ? '선물을 뽑고 있어요...' : '결과를 준비 중!'}
          </h2>
          <div className={styles.rouletteBoardContainer}>
            <div className={styles.roulettePointer} />
            <div
              className={styles.rouletteBoard}
              style={{
                background: `conic-gradient(${conicGradientStr})`,
                transform: `rotate(${rouletteRotation}deg)`
              }}
            >
              {items.map((item, i) => {
                const angle = (360 / items.length) * i + (360 / items.length) / 2;
                return (
                  <div key={`roulette-${item.id}`} className={styles.rouletteSlice} style={{ transform: `rotate(${angle}deg)` }}>
                    <div className={styles.rouletteContent}>
                      <span className={styles.sliceIcon}>{renderIcon(item.icon, 'roulette')}</span>
                      <span className={styles.sliceTitle}>
                        {item.title.length > 5 ? item.title.substring(0, 5) + '..' : item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className={styles.modalOverlay} onClick={() => setResult(null)}>
          <div className={styles.couponCard} onClick={e => e.stopPropagation()}>
            <div className={styles.couponIcon}>{renderIcon(result.icon, 'modal')}</div>
            <h2 className={styles.couponTitle}>{result.title}</h2>
            <p className={styles.couponDesc}>{result.description}</p>
            <button className={styles.primaryBtn} onClick={() => setResult(null)}>{MESSAGES.DRAW.KEEP_BUTTON}</button>
          </div>
        </div>
      )}
    </div>
  );
}

