'use client';

import React, { useState } from 'react';
import styles from '../../styles/SignupFormStep2.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiEdit3 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useSignup, genderToNumber, ageGroupToNumber } from '../../contexts/SignupContext';

export default function SignupStep2() {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'남성' | '여성' | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const router = useRouter();
  const { signupData, updateSignupData } = useSignup();

  const toggleFood = (food: string) => {
    setPreferredFoods(prev =>
      prev.includes(food)
        ? prev.filter(f => f !== food)
        : [...prev, food]
    );
  };

  const handleComplete = async () => {
    if (!nickname || !gender || !ageGroup || preferredFoods.length === 0) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    // Context에 데이터 저장 (숫자로 변환)
    updateSignupData({
      nickname,
      gender: genderToNumber(gender),
      age: ageGroupToNumber(ageGroup),
      price: price || undefined,
      favorite_food: preferredFoods
    });

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupData,
          nickname,
          gender: genderToNumber(gender),
          age: ageGroupToNumber(ageGroup),
          price: price || undefined,
          favorite_food: preferredFoods
        }),
      });

      if (response.ok) {
        // 회원가입 성공
        router.push('/signup/success');
      } else {
        // 회원가입 실패
        const errorData = await response.json();
        alert(errorData.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="logo"
          width={130}
          height={45}
          className={styles.logo}
        />
      </Link>
      <div className={styles.signupBox}>
        <div className={styles.inputWrapper}>
          <div className={styles.inputLabel}>
            <FiUser />
            <span>닉네임을 입력해주세요.</span>
          </div>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={styles.inputTop}
          />
          <div className={styles.inputDesc}>
            <span>닉네임은 한글, 영문, 숫자, 특수문자만 허용됩니다.</span>
          </div>

          <div className={styles.inputLabel} style={{ marginTop: '1.5rem' }}>
            <FiEdit3 />
            <span>당신에 대해 알려주세요.</span>
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

          <div className={styles.section}>
            <span className={styles.sectionTitle}>나이대를 선택해주세요.</span>
            <div className={styles.ageGrid}>
              <div className={styles.ageRow}>
                {['10대', '20대'].map(age => (
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
              <div className={styles.ageRow}>
                {['30대', '40대'].map(age => (
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
              <div className={styles.ageRow}>
                {['50대', '60대 이상'].map(age => (
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
              </div>
            </div>

          <div className={styles.section}>
            <span className={styles.sectionTitle}>선호하는 가격대를 선택해주세요.</span>
            <div className={styles.ageGrid}>
              <div className={styles.ageRow}>
                {['10,000원 이하', '15,000원 이하'].map(p => (
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
              <div className={styles.ageRow}>
                {['20,000원 이하', '25,000원 이하'].map(p => (
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
              <div className={styles.ageRow}>
                {['30,000원 이하', '30,000원 이상'].map(p => (
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
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionTitle}>선호하는 음식을 선택해주세요.</span>
            <div className={styles.foodGrid}>
              {[{ name: '한식', image: '/images/food_korean.jpg' },
                { name: '중식', image: '/images/food_chinese.jpg' },
                { name: '일식', image: '/images/food_japanese.jpg' },
                { name: '양식', image: '/images/food_western.jpg' },
                { name: '카페 & 디저트', image: '/images/food_cafe.jpg' },
                { name: '호프', image: '/images/food_pub.jpg' },
                { name: '비건', image: '/images/food_vegan.jpg' }].map(food => (
                <button
                  key={food.name}
                  type="button"
                  className={`${styles.foodItem} ${preferredFoods.includes(food.name) ? styles.activeFood : ''}`}
                  onClick={() => toggleFood(food.name)}
                >
                  <Image src={food.image} alt={food.name} width={120} height={80} className={styles.foodImage} />
                  <div className={styles.overlay}></div>
                  <span className={styles.foodLabel}>{food.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" className={styles.signupBtn} onClick={handleComplete}>
            완료하기
          </button>
        </div>
      </div>
    </div>
  );
}
