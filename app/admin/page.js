"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { MESSAGES } from '../../lib/messages';

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [coins, setCoins] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  const [newItemIcon, setNewItemIcon] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  const renderIcon = (iconStr) => {
    if (iconStr && iconStr.startsWith('data:image')) {
      return <img src={iconStr} alt="icon" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />;
    }
    return iconStr;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setNewItemIcon(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

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
    fetch('/api/items').then(r => r.json()).then(d => setApprovedItems(d));
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle) return alert("상품 이름을 입력해주세요");
    const res = await fetch('/api/admin/add-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon: newItemIcon, title: newItemTitle, description: newItemDesc })
    });
    if (res.ok) {
      alert("새 상품이 성공적으로 추가되었습니다!");
      setNewItemIcon('');
      setNewItemTitle('');
      setNewItemDesc('');
      fetchData();
    } else {
      alert("상품 추가에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("이 상품을 등록 목록에서 삭제하시겠습니까? (기존 당첨 기록에는 유지됩니다)")) return;
    const res = await fetch('/api/admin/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      alert("상품이 개별 삭제되었습니다.");
      fetchData();
    } else {
      alert("삭제 실패");
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("이 당첨 기록을 삭제하시겠습니까?")) return;
    const res = await fetch('/api/admin/history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      alert("기록이 삭제되었습니다.");
      fetchData();
    } else {
      alert("기록 삭제 실패");
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
      <div className={styles.backLinkWrapperHome} style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
        <Link href="/" className={styles.backLink}>← Home</Link>
      </div>
      <h1 className={styles.title}>👑 전용 관리자</h1>
      
      <section className={styles.section}>
        <div className={styles.glassCard}>
          <h2>⚙️ 새 상품 직접 추가</h2>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <label>상품 이미지 (필수)</label>
               <input 
                 type="file" accept="image/*" onChange={handleImageUpload}
                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }}
               />
               {newItemIcon && newItemIcon.startsWith('data:image') && (
                 <img src={newItemIcon} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
               )}
               <input 
                 value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} 
                 placeholder="상품 이름" 
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }}
               />
            </div>
            <input 
              value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} 
              placeholder="추가 설명 (선택사항)" 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)' }}
            />
            <button type="submit" className={`${styles.btn} ${styles.btnGreen}`} style={{ alignSelf: 'flex-end', marginTop: '5px' }}>추가하기</button>
          </form>
        </div>
      </section>
      
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
          <h2>🛍️ 등록된 상품 관리</h2>
          {approvedItems.length === 0 ? <p className={styles.emptyText}>등록된 상품이 없습니다.</p> : (
            approvedItems.map(item => (
              <div key={item.id} className={styles.pendingItem} style={{ borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={styles.pendingIcon}>{renderIcon(item.icon)}</span>
                  <div>
                    <strong className={styles.pendingTitle}>{item.title}</strong>
                    <div className={styles.pendingDesc}>{item.description}</div>
                  </div>
                </div>
                <div className={styles.pendingActions}>
                  {item.title !== '꽝' && (
                    <button onClick={() => handleDeleteItem(item.id)} className={`${styles.btn} ${styles.btnRed}`}>삭제</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.glassCard}>
          <h2>📝 승인 대기열</h2>
          {pending.length === 0 ? <p className={styles.emptyText}>{MESSAGES.ADMIN.EMPTY_PENDING}</p> : pending.map(item => (
            <div key={item.id} className={styles.pendingItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.pendingIcon}>{renderIcon(item.icon)}</span>
                <div>
                  <strong className={styles.pendingTitle}>{item.title}</strong>
                  <div className={styles.pendingDesc}>{item.description}</div>
                </div>
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
          {history.length === 0 ? <p className={styles.emptyText}>{MESSAGES.ADMIN.EMPTY_HISTORY}</p> : (
            <>
              {history.slice((historyPage - 1) * 10, historyPage * 10).map(h => (
                <div key={h.id} className={styles.historyItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={styles.historyIcon}>{renderIcon(h.item.icon)}</span> 
                    <strong className={styles.historyTitle}>{h.item.title}</strong>
                    <span className={styles.historyDate}>({new Date(h.drawnAt).toLocaleString()})</span>
                  </div>
                  <button onClick={() => handleDeleteHistory(h.id)} className={`${styles.btn} ${styles.btnRed}`} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>삭제</button>
                </div>
              ))}
              {history.length > 10 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                  <button 
                    disabled={historyPage === 1} 
                    onClick={() => setHistoryPage(p => p - 1)}
                    className={`${styles.btn} ${styles.btnGray}`} style={{ padding: '8px 12px', flex: '0 0 auto' }}
                  >
                    이전
                  </button>
                  <span style={{ margin: 'auto 0', fontWeight: 'bold' }}>{historyPage} / {Math.ceil(history.length / 10)}</span>
                  <button 
                    disabled={historyPage >= Math.ceil(history.length / 10)} 
                    onClick={() => setHistoryPage(p => p + 1)}
                    className={`${styles.btn} ${styles.btnGray}`} style={{ padding: '8px 12px', flex: '0 0 auto' }}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.glassCard} style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 style={{ color: '#ef4444' }}>⚠️ 위험 구역</h2>
          <p style={{ color: 'var(--text-muted)' }}>모든 상품과 당첨 기록들이 영구적으로 삭제됩니다.</p>
          <button 
            onClick={async () => {
              if (window.confirm("정말로 모든 상품(승인 대기열 포함)과 당첨 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                const res = await fetch('/api/admin/reset-items', { method: 'POST' });
                if (res.ok) {
                  alert("모든 상품과 기록이 초기화되었습니다.");
                  setHistoryPage(1);
                  fetchData();
                } else {
                  alert("초기화에 실패했습니다.");
                }
              }
            }} 
            className={`${styles.btn} ${styles.btnRed}`}
            style={{ marginTop: '15px', width: '100%' }}
          >
            모든 상품 및 기록 초기화
          </button>
        </div>
      </section>

      <div className={styles.backLinkWrapperHome}>
        <Link href="/" className={styles.backLink}>← Home</Link>
      </div>
    </div>
  );
}
