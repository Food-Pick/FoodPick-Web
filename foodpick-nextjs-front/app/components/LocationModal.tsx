import React, { useState, useEffect } from 'react';
import styles from '../../styles/locationModal.module.css';

interface LocationModalProps {
  onClose: () => void;
  onSelect: (address: string) => void;
}

const LocationModal = ({ onClose, onSelect }: LocationModalProps) => {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSido, setSelectedSido] = useState<string>('');
  const [selectedGugun, setSelectedGugun] = useState<string>('');
  const [selectedDong, setSelectedDong] = useState<string>('');

  useEffect(() => {
    // 모달 열릴 때 body 스크롤 잠금
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  useEffect(() => {
    fetch('/korea_regions.json')
      .then(res => res.json())
      .then(data => {
        setLocationData(data);
        setLoading(false);
      });
  }, []);

  const sidoList = locationData.map(item => item.sido);
  const gugunList = selectedSido ? locationData.find(item => item.sido === selectedSido)?.gugun.map((g: any) => g.name) : [];
  const dongList = selectedSido && selectedGugun
    ? locationData.find(item => item.sido === selectedSido)?.gugun.find((g: any) => g.name === selectedGugun)?.dongs
    : [];

  const handleSelect = () => {
    if (selectedSido && selectedGugun && selectedDong) {
      onSelect(`${selectedSido} ${selectedGugun} ${selectedDong}`);
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>지역 선택</h2>
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px 0'}}>지역 데이터를 불러오는 중...</div>
        ) : (
        <div className={styles.listSelectRow}>
          {/* 시/도 리스트 */}
          <div className={styles.listCol}>
            <div className={styles.listTitle}>시/도</div>
            <ul className={styles.listUl}>
              {sidoList.map((sido: string) => (
                <li
                  key={sido}
                  className={selectedSido === sido ? styles.selected : ''}
                  onClick={() => {
                    setSelectedSido(sido);
                    setSelectedGugun('');
                    setSelectedDong('');
                  }}
                >
                  {sido}
                </li>
              ))}
            </ul>
          </div>
          {/* 구/군 리스트 */}
          <div className={styles.listCol}>
            <div className={styles.listTitle}>구/군</div>
            <ul className={styles.listUl}>
              {gugunList?.map((gugun: string) => (
                <li
                  key={gugun}
                  className={selectedGugun === gugun ? styles.selected : ''}
                  onClick={() => {
                    if (selectedSido) {
                      setSelectedGugun(gugun);
                      setSelectedDong('');
                    }
                  }}
                  style={{ cursor: selectedSido ? 'pointer' : 'not-allowed', color: selectedSido ? undefined : '#aaa' }}
                >
                  {gugun}
                </li>
              ))}
            </ul>
          </div>
          {/* 동 리스트 */}
          <div className={styles.listCol}>
            <div className={styles.listTitle}>동</div>
            <ul className={styles.listUl}>
              {dongList?.map((dong: string) => (
                <li
                  key={dong}
                  className={selectedDong === dong ? styles.selected : ''}
                  onClick={() => {
                    if (selectedGugun) setSelectedDong(dong);
                  }}
                  style={{ cursor: selectedGugun ? 'pointer' : 'not-allowed', color: selectedGugun ? undefined : '#aaa' }}
                >
                  {dong}
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}
        <div className={styles.buttonRow}>
          <button onClick={onClose}>취소</button>
          <button onClick={handleSelect} disabled={!(selectedSido && selectedGugun && selectedDong)}>선택 완료</button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal; 