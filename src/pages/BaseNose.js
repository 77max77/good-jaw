import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

const BaseNose = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [showChoice, setShowChoice] = useState(false);
  const [baseNoseLengthCM, setBaseNoseLengthCM] = useState('');

  const handleInputChange = (e) => {
    e.stopPropagation();
    const value = e.target.value;
    if (value === '' || parseFloat(value) > 0) {
      setBaseNoseLengthCM(value);
      setErrorMessage('');
    } else {
      setErrorMessage('코의 길이는 0보다 큰 값을 입력해주세요.');
    }
  };

  const handleSubmit = async () => {
    if (!baseNoseLengthCM || errorMessage) return;

    // 1) localStorage에서 로그인 사용자 정보 꺼내기
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setErrorMessage('로그인 정보가 없습니다.');
      return;
    }
    const { email } = JSON.parse(storedUser);

    try {
      // 2) 이메일과 코 길이 함께 PATCH 요청
      const res = await fetch('/api/update-nose', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          noseLength: baseNoseLengthCM,
        }),
      });
      if (!res.ok) throw new Error('저장 실패');
      const { noseLength } = await res.json();

      // 3) 로컬에도 반영
      const updatedUser = { ...JSON.parse(storedUser), noseLength };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // 4) 성공 후 선택창 보여주기
      setShowChoice(true);
    } catch (err) {
      console.error(err);
      setErrorMessage('코 길이 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleChoice = (path) => {
    router.push(path);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    document.body.style.overflow = 'auto';
    router.push('/');
  };

  useEffect(() => {
    if (isDialogOpen || showChoice) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isDialogOpen, showChoice]);

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '400px', padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textAlign: 'center', position: 'relative'
  };

  const titleStyle = { fontSize: '1.4rem', marginBottom: '10px', color: '#333' };
  const messageStyle = { fontSize: '1rem', margin: '10px 0', color: '#555' };
  const imageStyle = { width: '80%', height: 'auto', margin: '10px 0', borderRadius: '8px' };
  const inputStyle = { width: '100px', padding: '8px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', marginRight: '5px' };
  const errorStyle = { color: '#d9534f', fontSize: '0.9rem', marginTop: '5px' };
  const btnContainer = { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' };
  const btnStyle = { flex: 1, padding: '10px 0', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' };
  const confirmBtn = { ...btnStyle, backgroundColor: '#4CAF50', color: '#fff' };
  const cancelBtn = { ...btnStyle, backgroundColor: '#f44336', color: '#fff' };

  if (!isDialogOpen && !showChoice) return null;

  return (
    <div style={overlayStyle} onClick={closeDialog}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {!showChoice ? (
          <>
            <p style={messageStyle}>아래 사진을 참고하세요.</p>
            <img src="/images/face.png" alt="코 길이 참조 이미지" style={imageStyle} />
            <h2 style={titleStyle}>코 길이 측정</h2>
            <p style={messageStyle}>코끝부터 양쪽 눈 사이 길이를 입력해주세요.</p>
            <div>
              <input
                type="number"
                value={baseNoseLengthCM}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="cm"
              />
              <span>cm</span>
            </div>
            {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
            <div style={btnContainer}>
              <button
                onClick={handleSubmit}
                style={{ ...confirmBtn, opacity: baseNoseLengthCM ? 1 : 0.6 }}
                disabled={!baseNoseLengthCM}
              >
                확인
              </button>
              <button onClick={closeDialog} style={cancelBtn}>취소</button>
            </div>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>측정 완료</h2>
            <p style={messageStyle}>코 길이: <strong>{baseNoseLengthCM} cm</strong></p>
            <p style={messageStyle}>불균형 측정을 진행하시겠습니까?</p>
            <div style={btnContainer}>
              <button
                onClick={() => handleChoice(`/mediapipe-measurement?baseNoseLengthCM=${baseNoseLengthCM}`)}
                style={confirmBtn}
              >
                불균형 측정하기
              </button>
              <button
                onClick={() => handleChoice('/')}
                style={cancelBtn}
              >
                메인으로 돌아가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BaseNose;