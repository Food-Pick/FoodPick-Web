'use client';

import React, { useState } from 'react';
import styles from '../styles/SignupForm.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSignup } from '../contexts/SignupContext';

export default function SignupStep1() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordCheckError, setPasswordCheckError] = useState('');
  const router = useRouter();
  const { updateSignupData } = useSignup();

  // 아이디 유효성 검사
  const validateId = (id: string) => {
    if (id.length < 4) {
      setIdError('아이디는 4자 이상이어야 합니다.');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(id)) {
      setIdError('아이디는 영문자와 숫자만 사용할 수 있습니다.');
      return false;
    }
    setIdError('');
    return true;
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password: string) => {
    if (password.length < 4) {
      setPasswordError('비밀번호는 4자 이상이어야 합니다.');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('비밀번호는 소문자를 포함해야 합니다.');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('비밀번호는 숫자를 포함해야 합니다.');
      return false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError('비밀번호는 특수문자(!@#$%^&*)를 포함해야 합니다.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // 비밀번호 확인 검사
  const validatePasswordCheck = (password: string, passwordCheck: string) => {
    if (passwordCheck && password !== passwordCheck) {
      setPasswordCheckError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPasswordCheckError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isIdValid = validateId(id);
    const isPasswordValid = validatePassword(password);
    const isPasswordCheckValid = validatePasswordCheck(password, passwordCheck);

    if (!isIdValid || !isPasswordValid || !isPasswordCheckValid) {
      return;
    }

    // Context에 데이터 저장
    updateSignupData({ id, password });
    
    // 아이디 중복 체크
    const response = await fetch(`/api/auth/register-check-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    console.log(response);

    if (response.ok) {
      // 아이디 중복 체크 성공
      router.push('/signup/step2');
    } else {
      // 아이디 중복 체크 실패
      alert('이미 사용중인 아이디입니다.');
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value;
    setId(newId);
    if (newId) {
      validateId(newId);
    } else {
      setIdError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      validatePassword(newPassword);
      if (passwordCheck) {
        validatePasswordCheck(newPassword, passwordCheck);
      }
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPasswordCheck = e.target.value;
    setPasswordCheck(newPasswordCheck);
    if (newPasswordCheck && password) {
      validatePasswordCheck(password, newPasswordCheck);
    } else {
      setPasswordCheckError('');
    }
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
            onChange={handleIdChange}
            className={styles.inputTop}
          />
          <span style={{ 
            display: 'block',
            fontSize: '0.8rem',
            color: idError ? 'red' : '#666',
            marginTop: '4px',
            marginBottom: '10px',
            height: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {idError || '아이디는 4자 이상의 영문자와 숫자만 허용합니다'}
          </span>

          <div className={styles.inputLabel} style={{marginTop: '1.2rem'}}>
            <span>비밀번호를 입력해주세요.</span>
          </div>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            className={styles.inputBottom}
          />
          <span style={{ 
            display: 'block',
            fontSize: '0.8rem',
            color: passwordError ? 'red' : '#666',
            marginTop: '4px',
            marginBottom: '10px',
            height: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {passwordError || '비밀번호는 4자 이상이어야 합니다.'}
          </span>

          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChange={handlePasswordCheckChange}
            className={styles.inputBottom}
          />
          <span style={{ 
            display: 'block',
            fontSize: '0.8rem',
            color: passwordCheckError ? 'red' : '#666',
            marginTop: '4px',
            marginBottom: '10px',
            height: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {passwordCheckError || '입력하신 비밀번호와 동일해야 합니다.'}
          </span>
        </div>
        <button type="submit" className={styles.signupBtn} style={{ marginTop: '1rem' }}>
          다음으로
        </button>
      </form>
    </div>
  );
} 