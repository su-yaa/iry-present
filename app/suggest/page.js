"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { MESSAGES } from '../../lib/messages';

export default function Suggest() {
  const router = useRouter();
  const [icon, setIcon] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

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
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setIcon(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert(MESSAGES.SUGGEST.EMPTY_TITLE);

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon, title, description: desc }),
    });

    if (res.ok) {
      alert(MESSAGES.SUGGEST.SUCCESS);
      router.push('/');
    } else {
      alert(MESSAGES.SUGGEST.ERROR);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>✨ 상품 조르기 ✨</h1>
        <p>이거 추가해줘!!</p>
      </div>

      <div className={styles.suggestForm}>
        <form onSubmit={handleSubmit} className={styles.glassCard}>
          <label className={styles.label}>상품 이미지 (필수)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.inputField} />
          {icon && (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <img src={icon} alt="preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
            </div>
          )}

          <label className={styles.label}>상품 이름</label>
          <input className={styles.inputField} value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 맛있는거 사주기" />

          <label className={styles.label}>추가 설명</label>
          <input className={styles.inputField} value={desc} onChange={e => setDesc(e.target.value)} placeholder="예: 무조건 사줘야 함 거절 불가" />

          <button type="submit" className={styles.primaryBtn}>{MESSAGES.SUGGEST.SUBMIT_BUTTON}</button>
        </form>
      </div>

      <Link href="/" className={styles.actionLink}>← 돌아가기</Link>
    </div>
  );
}
