'use client';

import React, { useState } from 'react';
import styles from '../../styles/LoginForm.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('로그인 시도');
  }

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
      <form className={styles.loginBox} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className={styles.inputTop}
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputBottom}
          />
        </div>
        <button type='submit' className={styles.loginBtn}>
        로그인 하기
        </button>
        <div className={styles.footerLinks}>
          <a className={styles.create}>계정 생성하기</a>
          <a>아이디 찾기</a>
          <a>비밀번호 찾기</a>
        </div>
      </form>
    </div>
  )
}