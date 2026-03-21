"use client";
import { useState, useEffect, useRef } from 'react';
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

  const [isCharging, setIsCharging] = useState(false);
  const [chargePower, setChargePower] = useState(0);
  const [spinDuration, setSpinDuration] = useState(3.8);
  const chargeIntervalRef = useRef(null);

  const scrollRef = useRef(null);
  const [isDraggingList, setIsDraggingList] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDrag = (e) => {
    setIsDraggingList(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const stopDrag = () => setIsDraggingList(false);
  const onDrag = (e) => {
    if (!isDraggingList) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const scrollLeftClick = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRightClick = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

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

  const handleDrawPress = () => {
    if (isDrawing || coins < 1) {
      if (coins < 1) alert(MESSAGES.DRAW.NOT_ENOUGH_COINS);
      return;
    }
    if (items.length === 0) {
      alert(MESSAGES.DRAW.EMPTY_ITEMS);
      return;
    }
    setIsCharging(true);
    setChargePower(0);
    chargeIntervalRef.current = setInterval(() => {
      setChargePower(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 20);
  };

  const handleDrawRelease = () => {
    if (!isCharging) return;
    setIsCharging(false);
    clearInterval(chargeIntervalRef.current);
    startDraw(chargePower);
  };

  const startDraw = async (power = 0) => {
    setIsDrawing(true);
    setRouletteRotation(0);
    setShowRoulette(true);

    const res = await fetch('/api/draw', { method: 'POST' });
    const data = await res.json();

    if (res.ok) {
      const winIndex = items.findIndex(item => item.id === data.item.id);
      const anglePerItem = 360 / items.length;
      
      const extraSpins = Math.floor((power / 100) * 15);
      const totalSpins = 5 + extraSpins;
      const targetAngle = 360 * totalSpins + 360 - (winIndex * anglePerItem + anglePerItem / 2);

      const duration = 3.8 + (extraSpins * 0.15);
      setSpinDuration(duration);

      setTimeout(() => {
        setRouletteRotation(targetAngle);
      }, 50);

      setTimeout(() => {
        setResult(data.item);
        setCoins(data.coinsRemaining);
        setShowRoulette(false);
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#ff758c', '#ff7eb3', '#a855f7', '#fbbf24', '#fff'] });
        setIsDrawing(false);
      }, duration * 1000 + 200);
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

      <div 
        className={styles.giftBoxContainer} 
        onMouseDown={handleDrawPress}
        onMouseUp={handleDrawRelease}
        onMouseLeave={handleDrawRelease}
        onTouchStart={handleDrawPress}
        onTouchEnd={handleDrawRelease}
        style={{ transform: isCharging ? `scale(${1 - (chargePower/100) * 0.1})` : '' }}
      >
        <div className={styles.giftBox} />
      </div>

      <button 
        className={styles.drawBtn} 
        onMouseDown={handleDrawPress}
        onMouseUp={handleDrawRelease}
        onMouseLeave={handleDrawRelease}
        onTouchStart={handleDrawPress}
        onTouchEnd={handleDrawRelease}
        disabled={isDrawing || coins < 1}
        style={{
          filter: isCharging ? `hue-rotate(${chargePower}deg)` : '',
          transform: isCharging ? `scale(${1 - (chargePower/100) * 0.05})` : ''
        }}
      >
        {isCharging ? `모으는 중... ${chargePower}%` : (isDrawing ? MESSAGES.DRAW.DRAWING : MESSAGES.DRAW.BUTTON_IDLE)}
      </button>

      <div className={styles.couponListTitle}>🎁 현재 뽑을 수 있는 상품들 🎁</div>
      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <button onClick={scrollLeftClick} style={{ position: 'absolute', left: '-15px', zIndex: 10, background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary)', boxShadow: '0 4px 10px var(--shadow-color)' }}>◀</button>
        <div 
          className={styles.couponListContainer}
          ref={scrollRef}
          onMouseDown={startDrag}
          onMouseLeave={stopDrag}
          onMouseUp={stopDrag}
          onMouseMove={onDrag}
          style={{ cursor: isDraggingList ? 'grabbing' : 'grab', padding: '10px 20px 15px 20px' }}
        >
        {items.filter(item => item.title !== '꽝').length === 0 ? <p className={styles.emptyText}>{MESSAGES.DRAW.EMPTY_ITEMS}</p> : items.filter(item => item.title !== '꽝').map(item => (
          <div key={item.id} className={styles.couponItem}>
            <div className={styles.couponItemIcon}>{renderIcon(item.icon, 'list')}</div>
            <div className={styles.couponItemTitle}>{item.title}</div>
          </div>
        ))}
        </div>
        <button onClick={scrollRightClick} style={{ position: 'absolute', right: '-15px', zIndex: 10, background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary)', boxShadow: '0 4px 10px var(--shadow-color)' }}>▶</button>
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
                transform: `rotate(${rouletteRotation}deg)`,
                transition: `transform ${spinDuration}s cubic-bezier(0.15, 0.85, 0.1, 1)`
              }}
            >
              {items.map((item, i) => {
                const angle = (360 / items.length) * i + (360 / items.length) / 2;
                return (
                  <div key={`roulette-${item.id}`} className={styles.rouletteSlice} style={{ transform: `rotate(${angle}deg)` }}>
                    <div className={styles.rouletteContent}>
                      <span className={styles.sliceIcon}>{renderIcon(item.icon, 'roulette')}</span>
                      <span className={styles.sliceTitle}>
                        {Array.from(item.title).length > 5 ? Array.from(item.title).slice(0, 5).join('') + '..' : item.title}
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

