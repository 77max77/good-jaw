import React from 'react';

export default function SurveyCard10({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const q10 = propSurvey.Q10 || {};

  const handleCheck = (field, value) => {
    const updated = { ...q10, [field]: value };
    if (value) updated.val5 = false;
    onSurveyChange({ ...propSurvey, Q10: updated });
  };

  const initAll = () => {
    const reset = { val1: false, val2: false, val3: false, val4: false, val5: true };
    onSurveyChange({ ...propSurvey, Q10: reset });
  };

  const next = () => {
    if (!q10.val1 && !q10.val2 && !q10.val3 && !q10.val4 && !q10.val5) {
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
        입을 벌리고 닫을 때 움직이기 힘들었던 적이 있나요?
      </h5>
      <div style={{ margin: '16px 0', display: 'grid', gap: '8px' }}>
        <label>
          <input
            type="checkbox"
            checked={q10.val1 === true}
            onChange={e => handleCheck('val1', e.target.checked)}
          /> 입을 벌릴 때 불편하다
        </label>
        <label>
          <input
            type="checkbox"
            checked={q10.val2 === true}
            onChange={e => handleCheck('val2', e.target.checked)}
          /> 입을 닫을 때 불편하다
        </label>
        <label>
          <input
            type="checkbox"
            checked={q10.val3 === true}
            onChange={e => handleCheck('val3', e.target.checked)}
          /> 아침에 주로 발생한다
        </label>
        <label>
          <input
            type="checkbox"
            checked={q10.val4 === true}
            onChange={e => handleCheck('val4', e.target.checked)}
          /> 저녁에 주로 발생한다
        </label>
        <label>
          <input
            type="checkbox"
            checked={q10.val5 === true}
            onChange={e => e.target.checked ? initAll() : handleCheck('val5', false)}
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