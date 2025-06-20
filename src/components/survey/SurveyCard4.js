import React, { useState, useEffect } from 'react';

export default function SurveyCard4({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [q4, setQ4] = useState(propSurvey.Q4);

  useEffect(() => {
    setQ4(propSurvey.Q4);
  }, [propSurvey.Q4]);

  const update = newQ4 => {
    setQ4(newQ4);
    onSurveyChange({ ...propSurvey, Q4: newQ4 });
  };

  const checkOption = (key, value) => {
    const next = { ...q4, [key]: value };
    // reset corresponding pain level if unchecked
    const optKey = key + 'Option';
    if (!value) next[optKey] = { opt1: 0 };
    // clear "해당 사항 없음"
    if (value) next.val5 = false;
    update(next);
  };

  const setPainLevel = (optKey, value) => {
    const next = { ...q4, [optKey]: { opt1: Number(value) } };
    update(next);
  };

  const initQuestion = value => {
    if (value) {
      const reset = {
        val1: false,
        val1Option: { opt1: 0 },
        val2: false,
        val2Option: { opt1: 0 },
        val3: false,
        val3Option: { opt1: 0 },
        val4: false,
        val4Option: { opt1: 0 },
        val5: true,
      };
      update(reset);
    } else {
      checkOption('val5', false);
    }
  };

  const handleNext = () => {
    const { val1, val2, val3, val4, val5 } = q4;
    if (!(val1 || val2 || val3 || val4 || val5)) {
      alert('최소한 1개 이상 선택 해 주세요');
      return;
    }
    onNext && onNext();
  };

  return (
    <section>
      <h5 style={{ textAlign: 'center', color: '#505050', margin: '0 0 8px' }}>
        턱 주변 통증이 언제 발생하나요?
      </h5>
      <p style={{ textAlign: 'center', color: '#505050', margin: '0 0 16px' }}>
        (중복선택 가능, 현재 통증 강도)
      </p>

      {/* Option 1 */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={q4.val1}
            onChange={e => checkOption('val1', e.target.checked)}
          /> 입을 벌리는 동작 중 (말하기, 함성, 씹기 등)
        </label>
        {q4.val1 && (
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <label>
              통증 강도:
              <input
                type="range"
                min="0"
                max="10"
                value={q4.val1Option.opt1}
                onChange={e => setPainLevel('val1Option', e.target.value)}
              />
              <span style={{ marginLeft: 8 }}>{q4.val1Option.opt1}</span>
            </label>
          </div>
        )}
      </div>

      {/* Option 2 */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={q4.val2}
            onChange={e => checkOption('val2', e.target.checked)}
          /> 입을 닫는 동작 중 (씹기, 삼키기 등)
        </label>
        {q4.val2 && (
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <label>
              통증 강도:
              <input
                type="range"
                min="0"
                max="10"
                value={q4.val2Option.opt1}
                onChange={e => setPainLevel('val2Option', e.target.value)}
              />
              <span style={{ marginLeft: 8 }}>{q4.val2Option.opt1}</span>
            </label>
          </div>
        )}
      </div>

      {/* Option 3 */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={q4.val3}
            onChange={e => checkOption('val3', e.target.checked)}
          /> 입을 움직이지 않을 때도 계속
        </label>
        {q4.val3 && (
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <label>
              통증 강도:
              <input
                type="range"
                min="0"
                max="10"
                value={q4.val3Option.opt1}
                onChange={e => setPainLevel('val3Option', e.target.value)}
              />
              <span style={{ marginLeft: 8 }}>{q4.val3Option.opt1}</span>
            </label>
          </div>
        )}
      </div>

      {/* Option 4 */}
      <div style={{ marginBottom: 16 }}>
        <label>
          <input
            type="checkbox"
            checked={q4.val4}
            onChange={e => checkOption('val4', e.target.checked)}
          /> 편두통 (머리 쪽 부위)
        </label>
        {q4.val4 && (
          <div style={{ marginLeft: 24, marginTop: 8 }}>
            <label>
              통증 강도:
              <input
                type="range"
                min="0"
                max="10"
                value={q4.val4Option.opt1}
                onChange={e => setPainLevel('val4Option', e.target.value)}
              />
              <span style={{ marginLeft: 8 }}>{q4.val4Option.opt1}</span>
            </label>
          </div>
        )}
      </div>

      {/* None */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={q4.val5}
            onChange={e => initQuestion(e.target.checked)}
          /> 해당 사항 없음
        </label>
      </div>

      {/* Next Button */}
      <div style={{ marginTop: 24 }}>
        <button onClick={handleNext}>다음</button>
      </div>
    </section>
  );
}

