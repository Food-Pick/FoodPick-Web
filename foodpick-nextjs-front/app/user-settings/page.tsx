'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../components/Header';
import styles from '../../styles/userSettingsPage.module.css';
import LikedListSectionWithData from '../components/LikedListSectionWithData';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'liked' | 'password' | 'delete'>('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [likedList, setLikedList] = useState([]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'liked') {
      setActiveTab('liked');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchLikedList = async () => {
      if (!session?.user?.id || !session?.user?.email) return;
      try {
        const res = await fetch(`/api/likes/${session.user.id}/${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          // 서버 데이터 → LikedListSectionWithData에 맞게 가공
          const grouped: any = {};
          data.forEach((like: any) => {
            if (!grouped[like.restaurantId]) {
              grouped[like.restaurantId] = {
                restaurantId: like.restaurantId,
                restaurantName: like.restaurantName,
                imageUrl: like.restaurantImage || null,
                foods: [],
              };
            }
            if (like.menuName) {
              grouped[like.restaurantId].foods.push(like.menuName);
            }
          });
          setLikedList(Object.values(grouped));
        }
      } catch (e) {
        console.error('찜 목록 불러오기 실패:', e);
      }
    };
    fetchLikedList();
  }, [session?.user?.id, session?.user?.email]);

  const handleProfileEdit = () => {
    router.push('/user-settings/profile'); 
  };

  const handlePasswordChange = () => {
    // 비밀번호 유효성 검사 등은 생략

    // 메시지 표시
    setShowSuccessMessage(true);

    // 3초 후 메시지 자동 제거
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

 const handleDeleteAccount = async () => {
    try {
      // 1. 탈퇴 API 호출 (백엔드 연결 시 실제로 사용)
      await fetch('/api/user/delete', { method: 'DELETE' });

      // 2. 로그아웃 처리 (예: 세션 쿠키 삭제용)
      await fetch('/api/auth/logout', { method: 'POST' });

      // 3. 홈으로 이동
      router.replace('/');
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.container}>
        <aside className={styles.sidebar}>
          <h2>계정 관리</h2>
          <nav>
            <ul>
              <li
                className={activeTab === 'profile' ? styles.active : ''}
                onClick={() => setActiveTab('profile')}
              >
                프로필 변경하기
              </li>
              <li
                className={activeTab === 'liked' ? styles.active : ''}
                onClick={() => setActiveTab('liked')}
              >
                찜 리스트
              </li>
              <li
                className={activeTab === 'password' ? styles.active : ''}
                onClick={() => setActiveTab('password')}
              >
                비밀번호 변경하기
              </li>
              <li
                className={activeTab === 'delete' ? styles.active : ''}
                onClick={() => setActiveTab('delete')}
              >
                회원 탈퇴하기
              </li>
            </ul>
          </nav>
        </aside>

        <section className={styles.content}>
          {activeTab === 'profile' && (
            <div className={styles.box}>
              <h3>프로필 변경하기</h3>
              <p>프로필 변경을 통해 닉네임, 나이, 성별, 선호 카테고리를 변경할 수 있습니다.</p>
              <button className={styles.primaryBtn} onClick={handleProfileEdit}>프로필 변경하기</button>
            </div>
          )}


          {activeTab === 'password' && (
            <div className={styles.box}>
              <h3>비밀번호 변경하기</h3>
              <p>주기적으로 비밀번호를 변경하면 계정 무단 사용을 방지할 수 있습니다.</p>
              <input type="password" placeholder="현재 비밀번호" />
              <input type="password" placeholder="새 비밀번호" />
              <input type="password" placeholder="새 비밀번호 확인" />
              <button className={styles.primaryBtn} onClick={handlePasswordChange}>변경사항 저장</button>

              {showSuccessMessage && (
                <p className={styles.successMessage}>비밀번호 변경이 완료되었습니다.</p>
              )}
            </div>
          )}

          {activeTab === 'liked' && <LikedListSectionWithData likedList={likedList} />}
          {activeTab === 'delete' && (
            <div className={styles.box}>
              <h3>회원 탈퇴하기</h3>
              <p>회원 탈퇴 시 모든 계정 정보가 삭제됩니다.</p>
              <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>회원 탈퇴하기</button>
            </div>
          )}

          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h4>정말 탈퇴하시겠습니까?</h4>
                <p>이 작업은 되돌릴 수 없습니다.</p>
                <div className={styles.modalButtons}>
                  <button className={styles.dangerBtn} onClick={handleDeleteAccount}>
                    탈퇴하기
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    취소하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}