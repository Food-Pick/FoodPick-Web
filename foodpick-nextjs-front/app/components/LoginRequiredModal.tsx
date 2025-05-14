'use client';
import React from 'react';
import styles from '../../styles/LoginRequiredModal.module.css';

type Props = {
  onClose: () => void;
};

export default function LoginRequiredModal({ onClose }: Props) {
  const handleLoginRedirect = () => {
    alert('로그인 하러 가기');
    onClose(); // 선택적으로 닫을지 말지 결정 가능
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <p className={styles.message}>리뷰 작성은 로그인이 필요합니다.</p>
        <div className={styles.buttonRow}>
          <button className={styles.cancelBtn} onClick={onClose}>취소하기</button>
          <button className={styles.loginBtn} onClick={handleLoginRedirect}>로그인 하러 가기</button>
        </div>
      </div>
    </div>
  );
}
