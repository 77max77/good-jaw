// src/components/survey/SurveyCard11.js
import React from 'react';

export default function SurveyCard11({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const q11 = propSurvey.Q11 || {};

  const handleCheck = (field, value) => {
    const updated = { ...q11, [field]: value };
    if (value) updated.val4 = false;
    onSurveyChange({ ...propSurvey, Q11: updated });
  };

  const initAll = () => {
    const reset = { val1: false, val2: false, val3: false, val4: true };
    onSurveyChange({ ...propSurvey, Q11: reset });
  };

  const next = () => {
    if (!q11.val1 && !q11.val2 && !q11.val3 && !q11.val4) {
      alert('최소한 1개 이상 선택 해 주세요');
      return;
    }
    onNext && onNext();
  };

  const prev = () => {
    onPrev && onPrev();
  };

  return (
    <section>
      <h5 className="text-center" style={{ color: '#505050' }}>
        움직임이 힘들 때 스스로 해결이 가능한가요?
      </h5>
      <div style={{ margin: '16px 0', display: 'grid', gap: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={q11.val1 === true}
            onChange={e => handleCheck('val1', e.target.checked)}
          /> 항상 해결 가능
        </label>
        <label>
          <input
            type="checkbox"
            checked={q11.val2 === true}
            onChange={e => handleCheck('val2', e.target.checked)}
          /> 가끔 가능 (가끔 불가능)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q11.val3 === true}
            onChange={e => handleCheck('val3', e.target.checked)}
          /> 항상 불가능 (다른 사람 도움 필요)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q11.val4 === true}
            onChange={e => e.target.checked ? initAll() : handleCheck('val4', false)}
          /> 없음
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={prev}>이전</button>
        <button onClick={next}>다음</button>
      </div>
    </section>
  );
}
