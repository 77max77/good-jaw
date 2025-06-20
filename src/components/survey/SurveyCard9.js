import React from 'react';

export default function SurveyCard9({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const q9 = propSurvey.Q9 || {};

  const handleCheck = (field, value) => {
    const updated = { ...q9, [field]: value };
    if (value) updated.val4 = false;
    onSurveyChange({ ...propSurvey, Q9: updated });
  };

  const initAll = () => {
    const reset = { val1: false, val2: false, val3: false, val4: true };
    onSurveyChange({ ...propSurvey, Q9: reset });
  };

  const next = () => {
    if (!q9.val1 && !q9.val2 && !q9.val3 && !q9.val4) {
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
      <h5 className="text-center" style={{ color: '#505050' }}>어떤 소리가 발생하나요</h5>
      <div style={{ margin: '16px 0', display: 'grid', gap: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={q9.val1 === true}
            onChange={e => handleCheck('val1', e.target.checked)}
          /> 나만 들리는 딸깍, 딱 소리
        </label>
        <label>
          <input
            type="checkbox"
            checked={q9.val2 === true}
            onChange={e => handleCheck('val2', e.target.checked)}
          /> 주변에도 들리는 덜컥, 뚝 소리
        </label>
        <label>
          <input
            type="checkbox"
            checked={q9.val3 === true}
            onChange={e => handleCheck('val3', e.target.checked)}
          /> 뼈가 닳거나 관절이 갈리는 소리
        </label>
        <label>
          <input
            type="checkbox"
            checked={q9.val4 === true}
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

