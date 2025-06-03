'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/userProfileSettingsPage.module.css'
import Header from '../../components/Header';
import { FiUser, FiEdit3, FiCheck, FiX } from 'react-icons/fi';

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState({
    nickname: '',
    gender: null as '남성' | '여성' | null,
    ageGroup: null as string | null,
    price: null as string | null,
    preferredFoods: [] as string[],
  });

  // 연령대 숫자를 한글로 변환하는 함수 추가
  const ageGroupMap: { [key: string]: string } = {
    '0': '10대',
    '1': '20대',
    '2': '30대',
    '3': '40대',
    '4': '50대 이상',
    '5': '미설정',
  };

  useEffect(() => {
    if (session?.user) {
      const userData = {
        nickname: session.user.nickname || '',
        gender: session.user.gender === 0 ? '남성' : '여성',
        ageGroup: ageGroupMap[String(session.user.age)] || '미설정',
        price: session.user.price || null,
        preferredFoods: Array.isArray(session.user.favorite_food) ? session.user.favorite_food : [],
      };
      setNickname(userData.nickname);
      setGender(userData.gender as '남성' | '여성');
      setAgeGroup(userData.ageGroup);
      setPrice(userData.price);
      setPreferredFoods(userData.preferredFoods);
      setTempData(userData as typeof tempData);
    }
  }, [session]);

  const toggleFood = (food: string) => {
    setPreferredFoods(prev =>
      prev.includes(food)
        ? prev.filter(f => f !== food)
        : [...prev, food]
    );
  };

  const handleEdit = () => {
    setTempData({
      nickname,
      gender,
      ageGroup,
      price,
      preferredFoods,
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setNickname(tempData.nickname);
    setGender(tempData.gender);
    setAgeGroup(tempData.ageGroup);
    setPrice(tempData.price);
    setPreferredFoods(tempData.preferredFoods);
    setEditMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          gender: gender === '남성' ? 0 : 1,
          age: ageGroup,
          price,
          favorite_food: preferredFoods,
        }),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        setEditMode(false);
        setTimeout(() => {
          setShowSuccessMessage(false);
          router.push('/user-settings');
        }, 2000);
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const renderField = (label: string, value: string | null, icon: React.ReactNode) => (
    <div className={styles.infoField}>
      <div className={styles.infoLabel}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={styles.infoValue}>{value || '미설정'}</div>
    </div>
  );

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.box} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className={styles.profileHeader}>
            <h3>프로필 정보</h3>
            {!editMode && (
              <button className={styles.editBtn} onClick={handleEdit}>
                <FiEdit3 /> 수정하기
              </button>
            )}
          </div>

          {!editMode ? (
            <div className={styles.profileInfo}>
              {renderField('닉네임', nickname, <FiUser />)}
              {renderField('성별', gender, <FiEdit3 />)}
              {renderField('연령대', ageGroup, <FiEdit3 />)}
              {renderField('선호 가격대', price, <FiEdit3 />)}
              <div className={styles.infoField}>
                <div className={styles.infoLabel}>
                  <FiEdit3 />
                  <span>선호 음식</span>
                </div>
                <div className={styles.foodTags}>
                  {preferredFoods.length > 0 ? (
                    preferredFoods.map(food => (
                      <span key={food} className={styles.foodTag}>
                        {food}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noFood}>선호 음식이 없습니다</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputLabel}>
                  <FiUser />
                  <span>닉네임</span>
                </div>
                <input
                  type="text"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={styles.inputTop}
                />

                <div className={styles.inputLabel} style={{ marginTop: '1.5rem' }}>
                  <FiEdit3 />
                  <span>성별</span>
                </div>
                <div className={styles.genderRow}>
                  {['남성', '여성'].map(option => (
                    <button
                      key={option}
                      type="button"
                      className={`${styles.selectButton} ${gender === option ? styles.active : ''}`}
                      onClick={() => setGender(option as '남성' | '여성')}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className={styles.inputLabel} style={{ marginTop: '1.5rem' }}>
                  <span>연령대</span>
                </div>
                <div className={styles.ageGroupRow}>
                  {['10대', '20대', '30대', '40대', '50대 이상'].map(age => (
                    <button
                      key={age}
                      type="button"
                      className={`${styles.selectButton} ${ageGroup === age ? styles.active : ''}`}
                      onClick={() => setAgeGroup(age)}
                    >
                      {age}
                    </button>
                  ))}
                </div>

                <div className={styles.inputLabel} style={{ marginTop: '1.5rem' }}>
                  <span>선호 가격대</span>
                </div>
                <div className={styles.priceRow}>
                  {['1만원 이하', '1-2만원', '2-3만원', '3만원 이상'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.selectButton} ${price === p ? styles.active : ''}`}
                      onClick={() => setPrice(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className={styles.inputLabel} style={{ marginTop: '1.5rem' }}>
                  <span>선호 음식</span>
                </div>
                <div className={styles.foodGrid}>
                  {['한식', '중식', '일식', '양식', '카페/디저트', '분식', '치킨', '피자', '햄버거', '샐러드'].map(food => (
                    <button
                      key={food}
                      type="button"
                      className={`${styles.foodButton} ${preferredFoods.includes(food) ? styles.active : ''}`}
                      onClick={() => toggleFood(food)}
                    >
                      {food}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.editButtons}>
                <button type="submit" className={styles.primaryBtn}>
                  <FiCheck /> 저장하기
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                  <FiX /> 취소하기
                </button>
              </div>

              {showSuccessMessage && (
                <p className={styles.successMessage}>프로필이 성공적으로 업데이트되었습니다.</p>
              )}
            </form>
          )}
        </div>
      </main>
    </>
  );
} 