"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Suggest() {
  const router = useRouter();
  const [icon, setIcon] = useState('🎁');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("제목을 입력해주세요!");

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon, title, description: desc }),
    });

    if (res.ok) {
      alert("성공적으로 제안했습니다! 심사를 기다려주세요.");
      router.push('/');
    } else {
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="app-container" style={{paddingTop: '30px'}}>
      <div className="header">
        <h1>✨ 상품 조르기 ✨</h1>
        <p>이거 추가해줘!!</p>
      </div>

      <div className="suggest-form">
        <form onSubmit={handleSubmit} className="glass-card">
          <label>아이콘 (이모지)</label>
          <input className="input-field" value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} />

          <label>상품 이름</label>
          <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 샤넬백 사주기" />

          <label>추가 설명</label>
          <input className="input-field" value={desc} onChange={e => setDesc(e.target.value)} placeholder="예: 무조건 사줘야 함 거절 불가" />

          <button type="submit" className="primary-btn" style={{marginTop: '5px'}}>제출하고 기다리기 🙏</button>
        </form>
      </div>

      <Link href="/" className="action-link" style={{marginTop: '10px'}}>← 돌아가기</Link>
    </div>
  );
}
