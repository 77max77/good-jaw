import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player'; // or appropriate video player import

export default function SurveyCard8({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [stage, setStage] = useState('painCheck'); // 'painCheck', 'painExample', 'painType'

  useEffect(() => {
    // Initialize if propSurvey.Q8 exists
    // survey.Q8 is managed externally
  }, [propSurvey.Q8]);

  const updateSurvey = updatedQ8 => {
    onSurveyChange({ ...propSurvey, Q8: updatedQ8 });
  };

  const handleCheckChange = (field, value) => {
    const updated = { ...propSurvey.Q8, [field]: value };
    if (value) updated.val7 = false;
    updateSurvey(updated);
  };

  const initAll = () => {
    const reset = { val1: false, val2: false, val3: false, val4: false, val5: false, val6: false, val7: true };
    updateSurvey(reset);
  };

  const next = () => {
    if (stage === 'painCheck') {
      setStage('painExample');
      return;
    }
    if (stage === 'painExample') {
      setStage('painType');
      return;
    }
    // painType
    const q = propSurvey.Q8;
    if (!q.val1 && !q.val2 && !q.val3 && !q.val4 && !q.val5 && !q.val6 && !q.val7) {
      alert('최소한 1개 이상 선택 해 주세요');
      return;
    }
    onNext && onNext();
  };

  const prev = () => {
    if (stage === 'painType') {
      setStage('painExample');
      return;
    }
    if (stage === 'painExample') {
      setStage('painCheck');
      return;
    }
    onPrev && onPrev();
  };

  const q = propSurvey.Q8 || {};

  return (
    <section>
      {stage === 'painCheck' && (
        <div style={{ margin: 16, padding: 16, border: '1px solid #E6E6E6', borderRadius: 16, color: '#505050' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 8px' }}>움직임 제한과 소리에 대한 평가를 시작하겠습니다.</h5>
          <p style={{ margin: '0 0 8px' }}>입을 벌리고 닫는 동안 소리가 난다면 체크해 주세요.</p>
          <p style={{ margin: 0 }}>* 심한 통증이나 턱이 빠지는 느낌이 있다면 시행하지 말고 평가 안함을 체크해 주세요.</p>
        </div>
      )}

      {stage === 'painExample' && (
        <div style={{ margin: 16, padding: 16, border: '1px solid #E6E6E6', borderRadius: 16, color: '#505050' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 8px' }}>영상을 보고 따라하면서 소리가 나는 시기를 체크해 주세요.</h5>
          <p style={{ margin: 0 }}>* 심한 통증이나 턱이 빠지는 느낌이 있다면 시행하지 말고 평가 안함을 체크해 주세요.</p>
        </div>
      )}

      {stage === 'painType' && (
        <>
          <h5 style={{ margin: '0 0 16px' }}>딸깍 소리가 언제 발생하나요?</h5>
          <div style={{ padding: '0 16px', marginBottom: 16 }}>
             <ReactPlayer
                url={survey.videoUrl}         // your video source
                controls
                width="100%"
                height="auto"
            />
          </div>
          <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            {Array.from({ length: 6 }, (_, i) => {
              const field = `val${i+1}`;
              const labelMap = [
                '벌리기 시작',
                '편안히 벌리기 (회전 운동)',
                '최대 벌리기 (아탈구)',
                '닫으려 할 때 (아탈구 정복)',
                '완전 닫기 (회전 운동)',
                '좌우로 움직일 때'
              ];
              return (
                <label key={field}>
                  <input
                    type="checkbox"
                    checked={q[field] === true}
                    onChange={e => handleCheckChange(field, e.target.checked)}
                  /> {labelMap[i]}
                </label>
              );
            })}
            <label>
              <input
                type="checkbox"
                checked={q.val7 === true}
                onChange={e => e.target.checked ? initAll() : handleCheckChange('val7', false)}
              /> 통증,불안감으로 평가 안 함
            </label>
          </div>
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={prev}>이전</button>
        <button onClick={next}>{stage === 'painType' ? '다음' : '다음'}</button>
      </div>
    </section>
  );
}
