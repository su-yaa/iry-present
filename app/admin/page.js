"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { MESSAGES } from '../../lib/messages';

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
      alert(MESSAGES.ADMIN.ACCESS_DENIED);
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
      alert(MESSAGES.ADMIN.APPROVE_SUCCESS(action));
      fetchData();
    }
  };

  if (!auth) {
    return (
      <div className={styles.loginCard}>
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
        <div className={styles.backLinkWrapper}>
          <Link href="/" className={styles.backLink}>← 로비로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>👑 전용 관리자</h1>
      
      <section className={styles.section}>
        <div className={styles.glassCard}>
          <h2>💰 코인 뱅크</h2>
          <p>현재 보유량: <strong className={styles.coinDisplay}>{coins}</strong> 코인</p>
          <div className={styles.coinActions}>
            <button onClick={() => addCoin(1)} className={`${styles.btn} ${styles.btnGreen}`}>이쁜짓! 코인 +1 지급</button>
            <button onClick={() => addCoin(-1)} className={`${styles.btn} ${styles.btnRed}`}>코인 -1 차감</button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.glassCard}>
          <h2>📝 승인 대기열</h2>
          {pending.length === 0 ? <p className={styles.emptyText}>{MESSAGES.ADMIN.EMPTY_PENDING}</p> : pending.map(item => (
            <div key={item.id} className={styles.pendingItem}>
              <div>
                <span className={styles.pendingIcon}>{item.icon}</span>
                <strong className={styles.pendingTitle}>{item.title}</strong>
                <div className={styles.pendingDesc}>{item.description}</div>
              </div>
              <div className={styles.pendingActions}>
                <button onClick={() => handleApprove(item.id, 'APPROVE')} className={`${styles.btn} ${styles.btnPink}`}>수락</button>
                <button onClick={() => handleApprove(item.id, 'REJECT')} className={`${styles.btn} ${styles.btnGray}`}>기각</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.glassCard}>
          <h2>🕵️ 이리 당첨 기록</h2>
          {history.length === 0 ? <p className={styles.emptyText}>{MESSAGES.ADMIN.EMPTY_HISTORY}</p> : history.map(h => (
            <div key={h.id} className={styles.historyItem}>
              <span className={styles.historyIcon}>{h.item.icon}</span> 
              <strong className={styles.historyTitle}>{h.item.title}</strong>
              <span className={styles.historyDate}>({new Date(h.drawnAt).toLocaleString()})</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.backLinkWrapperHome}>
        <Link href="/" className={styles.backLink}>← Home</Link>
      </div>
    </div>
  );
}
