
// src/components/survey/SurveyCard7.js
import React, { useState, useEffect } from 'react';

export default function SurveyCard7({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [model, setModel] = useState({
    type: [
      { pain: false, level: 0 },
      { pain: false, level: 0 },
      { pain: false, level: 0 }
    ]
  });

  const [painCheck, setPainCheck] = useState(true);
  const [painExample, setPainExample] = useState(false);
  const [painType, setPainType] = useState(false);
  const [cursor, setCursor] = useState(1);

  useEffect(() => {
    if (propSurvey.Q7) {
      setModel(propSurvey.Q7);
    }
  }, [propSurvey.Q7]);

  const update = newModel => {
    setModel(newModel);
    onSurveyChange({ ...propSurvey, Q7: newModel });
  };

  const next = () => {
    if (painCheck) {
      setPainCheck(false);
      setPainExample(true);
      return;
    }
    if (painExample) {
      setPainExample(false);
      setPainType(true);
      setCursor(1);
      return;
    }
    if (painType) {
      if (cursor < 3) {
        setCursor(prev => prev + 1);
        return;
      }
      onNext && onNext();
      return;
    }
    onNext && onNext();
  };

  const prev = () => {
    if (painCheck) {
      onPrev && onPrev();
      return;
    }
    if (painExample) {
      setPainCheck(true);
      setPainExample(false);
      return;
    }
    if (painType) {
      if (cursor > 1) {
        setCursor(prev => prev - 1);
        return;
      }
      setPainType(false);
      setPainExample(true);
      return;
    }
    onPrev && onPrev();
  };

  const handleTogglePain = (index, value) => {
    const newTypes = model.type.map((t, i) =>
      i === index ? { ...t, pain: value, level: value ? t.level : 0 } : t
    );
    update({ type: newTypes });
  };

  const handleLevel = (index, value) => {
    const newTypes = model.type.map((t, i) =>
      i === index ? { ...t, level: Number(value) } : t
    );
    update({ type: newTypes });
  };

  const renderSection = idx => {
    const img1 = `/assets/pain_image_7_${idx+1}_1.svg`;
    const img2 = `/assets/pain_image_7_${idx+1}_2.svg`;
    return (
      <div key={idx}>
        <div style={{ display: 'flex', gap: 16, margin: '0 0 16px' }}>
          <img src={img1} alt="example1" style={{ display: 'inline-block' }} />
          <img src={img2} alt="example2" style={{ display: 'inline-block' }} />
        </div>
        <label>
          <input
            type="checkbox"
            checked={model.type[idx].pain}
            onChange={e => handleTogglePain(idx, e.target.checked)}
          /> 눌렀을 때 통증 있음
        </label>
        {model.type[idx].pain && (
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <label>
              통증 강도:
              <input
                type="range"
                min="0"
                max="10"
                value={model.type[idx].level}
                onChange={e => handleLevel(idx, e.target.value)}
              />
              <span style={{ marginLeft: 8 }}>{model.type[idx].level}</span>
            </label>
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <label>
            <input
              type="checkbox"
              checked={!model.type[idx].pain}
              onChange={() => handleTogglePain(idx, false)}
            /> 통증 없음
          </label>
        </div>
      </div>
    );
  };

  return (
    <section>
      {painCheck && (
        <div style={{ padding: 16, margin: '16px', border: '1px solid #E6E6E6', borderRadius: 16, color: '#505050' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 8px' }}>이번에는 연관통에 대한 질문입니다.</h5>
          <p style={{ margin: '0 0 8px' }}>압통은 눌렀을 때 그 부분이 아파야 하지만 연관통이라는 증상은 눌렀을 때 다른 부위에서 통증이 느껴지는 것을 말합니다.</p>
          <p style={{ margin: 0 }}>* 연관통이 있으면 신경의 문제가 고려됩니다.</p>
        </div>
      )}
      {painExample && (
        <div style={{ padding: 16, margin: '16px', border: '1px solid #E6E6E6', borderRadius: 16, color: '#505050' }}>
          <h5 style={{ margin: '0 0 16px' }}>
            예시) <img src="/assets/ic-target-spot.svg" alt="target" style={{ width: 32 }} /> 부분을 누르는 동안 <img src="/assets/ic-red-spot.svg" alt="red" style={{ width: 32 }} /> 영역에서 통증이 느껴지는 경우를 연관통이라고 합니다.
          </h5>
          <div style={{ textAlign: 'right', color: '#999', margin: '0 0 16px' }}>
            <img src="/assets/ic-target-spot.svg" alt="target" style={{ width: 24 }} /> : 누르는 점<br />
            <img src="/assets/ic-red-spot.svg" alt="red" style={{ width: 32 }} /> : 통증을 느끼는 구역
          </div>
        </div>
      )}
      {painType && renderSection(cursor-1)}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={prev}>이전</button>
        <button onClick={next}>다음</button>
      </div>
    </section>
  );
}
