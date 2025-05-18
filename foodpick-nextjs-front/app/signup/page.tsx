'use client';

import React, { useState } from 'react';
import styles from '../styles/SignupForm.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignupStep1() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password || !passwordCheck) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordCheck) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    // TODO: 2단계로 이동 (라우팅 또는 상태 변경)
    router.push('/signup/step2');
  };

  return (
    <div className={styles.container}>
      <Link href="/">
        <Image
          src="/images/logo.png"
          alt="FoodPick 로고"
          width={130}
          height={45}
          className={styles.logo}
        />
      </Link>
      <form className={styles.signupBox} onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>계정 생성하기</h2>
        <div className={styles.inputWrapper}>
          <div className={styles.inputLabel}>
            <span>아이디를 입력해주세요.</span>
          </div>
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setId(e.target.value)}
            className={styles.inputTop}
          />
          <div className={styles.inputDesc}>
            <span>아이디는 영어 소문자, 대문자, 숫자만 허용합니다</span>
          </div>

          <div className={styles.inputLabel} style={{marginTop: '1.2rem'}}>
            <span>비밀번호를 입력해주세요.</span>
          </div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className={styles.inputBottom}
          />
          <div className={styles.inputDesc}>
            <span>비밀번호는 영어 소문자, 대문자, 숫자만을 허용합니다</span>
          </div>

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordCheck(e.target.value)}
            className={styles.inputBottom}
          />
          <div className={styles.inputDesc}>
            <span>입력하신 비밀번호와 동일해야 합니다.</span>
          </div>
        </div>
        {error && <div style={{ color: 'red', margin: '0.5rem 0', textAlign: 'center' }}>{error}</div>}
        <button type="submit" className={styles.signupBtn} style={{ marginTop: '1rem' }}>
          다음으로
        </button>
      </form>
    </div>
  );
} 