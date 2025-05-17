import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import styles from '../../styles/locationModal.module.css';

interface LocationModalProps {
  onClose: () => void;
  onSelect: (address: string, latitude: number, longitude: number) => void;
}

const LocationModal = ({ onClose, onSelect }: LocationModalProps) => {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSido, setSelectedSido] = useState<string>('');
  const [selectedGugun, setSelectedGugun] = useState<string>('');
  const [selectedDong, setSelectedDong] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tempSelectedLocation, setTempSelectedLocation] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 환경 체크
    const checkMobile = () => {
      const wasMobile = isMobile;
      const isNowMobile = window.innerWidth <= 767;
      setIsMobile(isNowMobile);
      
      // PC에서 모바일로 전환될 때
      if (!wasMobile && isNowMobile && selectedSido && selectedGugun && selectedDong) {
        setSearchQuery(`${selectedSido} ${selectedGugun} ${selectedDong}`);
      }
      // 모바일에서 PC로 전환될 때
      else if (wasMobile && !isNowMobile && searchQuery) {
        setSearchQuery('');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile, selectedSido, selectedGugun, selectedDong, searchQuery]);

  useEffect(() => {
    // 모달 열릴 때 body 스크롤 잠금
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;

    return () => {
      // 모달 닫힐 때 body 스크롤 복원
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = locationData.flatMap(sido => 
        sido.gugun.flatMap((gugun: { name: string; dongs: string[] }) => 
          gugun.dongs.map((dong: string) => ({
            sido: sido.sido,
            gugun: gugun.name,
            dong: dong,
            fullAddress: `${sido.sido} ${gugun.name} ${dong}`
          }))
        )
      ).filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return item.fullAddress.toLowerCase().includes(searchLower) ||
              item.sido.toLowerCase().includes(searchLower) || 
              item.gugun.toLowerCase().includes(searchLower) || 
              item.dong.toLowerCase().includes(searchLower);
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, locationData]);

  const sidoList = locationData.map(item => item.sido);
  const gugunList = selectedSido ? locationData.find(item => item.sido === selectedSido)?.gugun.map((g: any) => g.name) : [];
  const dongList = selectedSido && selectedGugun
    ? locationData.find(item => item.sido === selectedSido)?.gugun.find((g: any) => g.name === selectedGugun)?.dongs
    : [];

  const handleSearchSelect = (result: any) => {
    setTempSelectedLocation(result);
    setSelectedSido(result.sido);
    setSelectedGugun(result.gugun);
    setSelectedDong(result.dong);
    setSearchQuery(`${result.sido} ${result.gugun} ${result.dong}`);
  };

  const handleSelect = async () => {
    if (selectedSido && selectedGugun && selectedDong) {
      const fullAddress = `${selectedSido} ${selectedGugun} ${selectedDong}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=kr&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          onSelect(fullAddress, parseFloat(lat), parseFloat(lon));
        } else {
          onSelect(fullAddress, 37.5665, 126.9780);
        }
        onClose();
      } catch (error) {
        onSelect(fullAddress, 37.5665, 126.9780);
        onClose();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    // 검색창이 수정되면 선택된 지역 정보 초기화
    if (selectedSido && selectedGugun && selectedDong) {
      setSelectedSido('');
      setSelectedGugun('');
      setSelectedDong('');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>지역 선택</h2>
        <div className={styles.searchBox}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
            <FiSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="시/도, 구/군, 동 검색"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        {searchQuery.trim() && !selectedSido ? (
          <div className={styles.searchResults}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={styles.searchResultItem}
                onClick={() => handleSearchSelect(result)}
              >
                <span className={styles.resultSido}>{result.sido}</span>
                <span className={styles.resultGugun}>{result.gugun}</span>
                <span className={styles.resultDong}>{result.dong}</span>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className={styles.noResults}>검색 결과가 없습니다</div>
            )}
          </div>
        ) : (
          loading ? (
            <div style={{textAlign: 'center', padding: '40px 0'}}>지역 데이터를 불러오는 중...</div>
          ) : !isMobile ? (
            <div className={styles.listSelectRow}>
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
          ) : (
            <div className={styles.searchResults}>
              {selectedSido && selectedGugun && selectedDong ? (
                <div className={styles.searchResultItem}>
                  <span className={styles.resultSido}>{selectedSido}</span>
                  <span className={styles.resultGugun}>{selectedGugun}</span>
                  <span className={styles.resultDong}>{selectedDong}</span>
                </div>
              ) : (
                <div className={styles.noResults}>지역을 검색해주세요</div>
              )}
            </div>
          )
        )}
        <div className={styles.buttonRow}>
          <button onClick={onClose}>취소</button>
          <button 
            onClick={handleSelect} 
            disabled={!(selectedSido && selectedGugun && selectedDong)}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal; 