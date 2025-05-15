'use client';
import React from 'react';
import styles from '../../styles/ReviewDeleteConfirmModal.module.css';

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ReviewDeleteConfirmModal({ onCancel, onConfirm }: Props ) {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation}>
        <p className={styles.message}>리뷰를 삭제하시겠습니까?</p>
        <div className={styles.buttonRow}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소하기</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>삭제하기</button>
        </div>
      </div>
    </div>
  )
}