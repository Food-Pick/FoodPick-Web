'use client';

import React, { useState } from 'react';
import styles from '../../styles/ReviewModal.module.css';
import StarRating from './StarRating';
import { FiCamera } from 'react-icons/fi';

{/* 수정 모드가 없는 모달 */}
// type Props = {
//   restaurantName: string;
//   onClose: () => void;
//   onSubmit: (rating: number, content: string, images: File[]) => void;
// };

type Props = {
  restaurantName: string;
  onClose: () => void;
  onSubmit: (rating: number, content: string, images: (File | string)[]) => void;
  isEditMode?: boolean; // ✅ 선택적 prop으로 추가
  initialData?: {
    rating: number;
    content: string;
    images: string[];
  };
};

export default function ReviewModal({ restaurantName, onClose, onSubmit, initialData, isEditMode }: Props) {
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [content, setContent] = useState(initialData?.content ?? '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? []);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = () => {
    onSubmit(rating, content, [...existingImages, ...imageFiles]);
    onClose();
  };
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        <h3 className={styles.title}>
          <strong>{restaurantName}</strong><br />
          방문리뷰를 적어주세요.
        </h3>

        <hr className={styles.divider} />

        <p className={styles.subheading}>음식은 만족하셨나요?</p>
        <StarRating rating={rating} setRating={setRating} />

        <p className={styles.subheading}>어떤 점이 좋았나요?</p>
        <textarea
          className={styles.textarea}
          placeholder='다른 고객님에게 도움이 되도록 해당 가게에 대해 솔직한 평가를 남겨주세요.'
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={styles.uploadBtnWrapper}>
          <label className={styles.uploadBtn}>
            <FiCamera size={20} />
            사진첨부하기
            <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>

        {(existingImages.length > 0 || imageFiles.length > 0) && (
          <div className={styles.imagePreview}>
            {/* 기존 이미지 미리보기 */}
            {existingImages.map((src, idx) => (
              <div key={`existing-${idx}`} className={styles.previewWrapper}>
                <img
                  src={src}
                  alt={`기존 이미지 ${idx}`}
                  className={styles.previewImg}
                />
                <button
                  className={styles.deleteImgBtn}
                  onClick={() => {
                    setExistingImages(prev => prev.filter((_, i) => i !== idx));
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {/* 새로 업로드한 이미지 미리보기 */}
            {imageFiles.map((file, idx) => (
              <div key={`file-${idx}`} className={styles.previewWrapper}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`업로드 이미지 ${idx}`}
                  className={styles.previewImg}
                />
                <button
                  className={styles.deleteImgBtn}
                  onClick={() => {
                    const updated = [...imageFiles];
                    updated.splice(idx, 1);
                    setImageFiles(updated);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <hr className={styles.divider} />

        <div className={styles.buttonRow}>
          <button className={styles.cancelBtn} onClick={onClose}>취소하기</button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={rating === 0 || content.trim() === ''}
          >
            {isEditMode ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}