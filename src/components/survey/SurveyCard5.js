import React, { useState, useEffect } from 'react';

export default function SurveyCard5({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [model, setModel] = useState({
    pain: null,
    type: [
      { pain: false, level: 0 },
      { pain: false, level: 0 },
      { pain: false, level: 0 },
      { pain: false, level: 0 }
    ]
  });

  const [painCheck, setPainCheck] = useState(true);
  const [painType, setPainType] = useState(false);
  const [painCursor, setPainCursor] = useState(1);

  useEffect(() => {
    if (propSurvey.Q5) {
      setModel(propSurvey.Q5);
    }
  }, [propSurvey.Q5]);

  const update = newModel => {
    setModel(newModel);
    onSurveyChange({ ...propSurvey, Q5: newModel });
  };

  const handlePainSelect = value => {
    update({ ...model, pain: value });
  };

  const handleTypePain = (index, value) => {
    const newTypes = model.type.map((t, i) =>
      i === index ? { ...t, pain: value, level: value ? t.level : 0 } : t
    );
    update({ ...model, type: newTypes });
  };

  const handleTypeLevel = (index, level) => {
    const newTypes = model.type.map((t, i) =>
      i === index ? { ...t, level } : t
    );
    update({ ...model, type: newTypes });
  };

  const next = () => {
    if (painCheck) {
      if (model.pain === null) {
        alert('질문에 응답을 해 주세요.');
        return;
      }
      if (model.pain) {
        setPainCheck(false);
        setPainType(true);
        return;
      }
    }

    if (painType) {
      if (painCursor < 4) {
        setPainCursor(prev => prev + 1);
        return;
      }
      onNext && onNext();
      return;
    }

    onNext && onNext();
  };

  const prev = () => {
    if (painType) {
      if (painCursor > 1) {
        setPainCursor(prev => prev - 1);
        return;
      }
      setPainType(false);
      setPainCheck(true);
      return;
    }
    onPrev && onPrev();
  };

  const renderPainType = () => {
    const labels = [
      '귀 안쪽에 평소 통증 있음',
      '관자근에 평소 통증 있음',
      '턱 뼈에 평소 통증 있음',
      '깨물근에 평소 통증 있음'
    ];
    const idx = painCursor - 1;
    return (
      <div>
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <img
            src={`/assets/pain_image_5_${painCursor}.svg`}
            alt="Pain"
            style={{ width: '20rem' }}
          />
        </div>
        <label>
          <input
            type="checkbox"
            checked={model.type[idx].pain}
            onChange={e => handleTypePain(idx, e.target.checked)}
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
                onChange={e => handleTypeLevel(idx, Number(e.target.value))}
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
              onChange={() => handleTypePain(idx, false)}
            /> 통증 없음
          </label>
        </div>
      </div>
    );
  };

  return (
    <section>
      <h2>일상생활 중 통증 유무에 대한 질문입니다.</h2>
      <p style={{ marginBottom: '16px' }}>
        일상생활이란 말하기, 밥먹기, 걷기 등 기본 생활을 모두 포함합니다.
      </p>

      {painCheck && (
        <div>
          <label>
            <input
              type="radio"
              name="painCheck"
              checked={model.pain === true}
              onChange={() => handlePainSelect(true)}
            /> 평소 통증 있음
          </label>
          <label style={{ marginLeft: '16px' }}>
            <input
              type="radio"
              name="painCheck"
              checked={model.pain === false}
              onChange={() => handlePainSelect(false)}
            /> 평소 통증 없음
          </label>
        </div>
      )}

      {painType && renderPainType()}

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={prev}>이전</button>
        <button onClick={next}>다음</button>
      </div>
    </section>
  );
}

