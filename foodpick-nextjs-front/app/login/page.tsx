'use client';

import React, { useState } from 'react';
import styles from '../../styles/LoginForm.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        id: id,
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      router.push("/");
      router.refresh();

      
    } catch (error) {
      console.error(error);
      setError("로그인 중 오류가 발생했습니다.");
    }
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
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setId(e.target.value)}
            className={styles.inputTop}
          />
          
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            required
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className={styles.inputBottom}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type='submit' className={styles.loginBtn}>
          로그인 하기
        </button>
        <div className={styles.footerLinks}>
          <Link href="/signup" className={styles.create}>계정 생성하기</Link>
          <a>아이디 찾기</a>
          <a>비밀번호 찾기</a>
        </div>
      </form>
    </div>
  )
}