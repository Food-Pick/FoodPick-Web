'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SignupData {
  id: string;
  password: string;
  // step2에서 추가될 데이터들
  nickname?: string;
  gender?: number; // 0: 남성, 1: 여성
  age?: number; // 0: 10대, 1: 20대, 2: 30대, 3: 40대, 4: 50대, 5: 60대 이상
  favorite_food?: string[];
}

// 성별 문자열을 숫자로 변환
export const genderToNumber = (gender: '남성' | '여성'): number => {
  return gender === '남성' ? 0 : 1;
};

// 나이대 문자열을 숫자로 변환
export const ageGroupToNumber = (ageGroup: string): number => {
  const ageMap: { [key: string]: number } = {
    '10대': 0,
    '20대': 1,
    '30대': 2,
    '40대': 3,
    '50대': 4,
    '60대 이상': 5
  };
  return ageMap[ageGroup] ?? 0;
};

interface SignupContextType {
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [signupData, setSignupData] = useState<SignupData>({
    id: '',
    password: '',
  });

  console.log(signupData);

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  };

  return (
    <SignupContext.Provider value={{ signupData, updateSignupData }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
} 