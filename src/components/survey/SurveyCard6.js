import React, { useState, useEffect } from 'react';

export default function SurveyCard6({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [model, setModel] = useState({
    type: [
      { pain: false, level: 0 },
      { pain: false, level: 0 },
      { pain: false, level: 0 },
      { pain: false, level: 0 }
    ]
  });

  const [painCheck, setPainCheck] = useState(true);
  const [painType, setPainType] = useState(false);
  const [cursor, setCursor] = useState(1);

  useEffect(() => {
    if (propSurvey.Q6) {
      setModel(propSurvey.Q6);
    }
  }, [propSurvey.Q6]);

  const update = newModel => {
    setModel(newModel);
    onSurveyChange({ ...propSurvey, Q6: newModel });
  };

  const handleNext = () => {
    if (painCheck) {
      setPainCheck(false);
      setPainType(true);
      return;
    }
    if (painType) {
      if (cursor < 4) {
        setCursor(prev => prev + 1);
        return;
      }
      onNext && onNext();
      return;
    }
    onNext && onNext();
  };

  const handlePrev = () => {
    if (painCheck) {
      onPrev && onPrev();
      return;
    }
    if (painType) {
      if (cursor > 1) {
        setCursor(prev => prev - 1);
        return;
      }
      setPainType(false);
      setPainCheck(true);
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
    const imgSrc = `/assets/pain_image_6_${idx + 1}.svg`;
    const labels = [
      '눌렀을 때 통증 있음',
      '눌렀을 때 통증 있음',
      '눌렀을 때 통증 있음',
      '눌렀을 때 통증 있음'
    ];
    return (
      <div key={idx}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <img src={imgSrc} alt="spot" style={{ width: '20rem' }} />
        </div>
        <label>
          <input
            type="checkbox"
            checked={model.type[idx].pain}
            onChange={e => handleTogglePain(idx, e.target.checked)}
          /> {labels[idx]}
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
        <div style={{ margin: '16px', padding: '16px', border: '1px solid #e6e6e6', borderRadius: '1rem', color: '#505050' }}>
          <h5 style={{ textAlign: 'center', margin: '0 0 8px' }}>압통에 대한 설문 입니다.</h5>
          <p style={{ margin: '0 0 8px' }}>사진에 빨간 색으로 표시된 부위를 1Kg 정도의 압력으로 지긋이 1~2초 눌러 주세요.</p>
          <p style={{ margin: 0 }}>누른 상태에서 누른 부위에서 발생되는 통증 정도에 대해서 답을 해주시기 바랍니다.</p>
        </div>
      )}
      {painType && renderSection(cursor - 1)}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handlePrev}>이전</button>
        <button onClick={handleNext}>다음</button>
      </div>
    </section>
  );
}
