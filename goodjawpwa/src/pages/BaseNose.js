import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

const BaseNose = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [baseNoseLengthCM, setBaseNoseLengthCM] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (value === '' || parseFloat(value) > 0) {
      setBaseNoseLengthCM(value);
      setErrorMessage('');
    } else {
      setErrorMessage('코의 길이는 0보다 큰 값을 입력해주세요.');
    }
  };

  const handleSubmit = () => {
    router.push({
      pathname: '/FaceDetection',
      query: { baseNoseLengthCM: baseNoseLengthCM },
    });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    if (isDialogOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDialogOpen]);

  return (
    <>
      {isDialogOpen && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContent}>
            <div style={styles.header}>
              <h1 style={styles.headerText}>측정 방법</h1>
            </div>

            <div style={styles.instructionSection}>
              <img src="/images/chin_info.png" alt="측정 이미지" style={styles.chinImage} />
            </div>

            <p style={styles.description}>
              실제 코의 길이를 기준으로<br /> 턱 측정이 진행됩니다.
            </p>

            <div style={styles.warningBox}>
              코 라인이 아닌 지면과 수직으로 측정해주세요.
              <br />
              측정 기준: 코끝부터 양쪽 눈 사이
            </div>

            <div style={styles.inputSection}>
              <label style={styles.inputLabel}>코의 길이:</label>
              <input
                type="number"
                value={baseNoseLengthCM}
                onChange={handleInputChange}
                placeholder="코의 길이를 입력하세요"
                style={styles.input}
              />
              cm
            </div>

            {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}

            <div style={styles.instructionSection}>
              <p style={styles.note}>아래 사진을 참고하세요.</p>
              <img src="/images/face.png" alt="코 길이 측정 참조 이미지" style={styles.faceImage} />
            </div>

            <div style={styles.buttonContainer}>
              <button onClick={handleSubmit} style={styles.closeButton} disabled={!baseNoseLengthCM}>
                확인
              </button>
              <button onClick={closeDialog} style={styles.submitButton}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  dialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContent: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    width: '95vw',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflowY: 'auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#a8d8ff',
    padding: '15px 0',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    textAlign: 'center',
  },
  headerText: {
    fontSize: '1.5rem',
    color: '#ffffff',
    margin: 0,
  },
  instructionSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chinImage: {
    width: '80%',
    height: 'auto',
    marginTop: '20px',
  },
  description: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  warningBox: {
    backgroundColor: '#ffe4e4',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '0.9rem',
    color: '#d9534f',
    marginBottom: '20px',
    width: '90%',
  },
  inputSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px',
  },
  inputLabel: {
    fontSize: '1rem',
    marginRight: '10px',
  },
  input: {
    width: '150px',
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    textAlign: 'center',
    marginRight: '5px',
  },
  note: {
    fontSize: '0.9rem',
    color: '#555',
    marginBottom: '10px',
  },
  faceImage: {
    width: '40%',
    height: 'auto',
    maxWidth: '180px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderTop: '1px solid #a8d8ff',
  },
  closeButton: {
    padding: '15px 0',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    color: '#007bff',
    border: 'none',
    borderRight: '1px solid #a8d8ff',
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    padding: '15px 0',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    color: '#007bff',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#d9534f',
    fontSize: '0.9rem',
    marginBottom: '10px',
  },
};

export default BaseNose;
