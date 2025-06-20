// src/components/survey/SurveyCard1.js
import React, { useState, useEffect } from 'react';

export default function SurveyCard1({ survey: propSurvey, onSurveyChange }) {
  const [q1, setQ1] = useState(propSurvey.Q1);

  useEffect(() => {
    setQ1(propSurvey.Q1);
  }, [propSurvey.Q1]);

  const update = newQ1 => {
    setQ1(newQ1);
    onSurveyChange({ ...propSurvey, Q1: newQ1 });
  };

  const handleToggle = (field, value) => {
    const next = { ...q1, [field]: value };
    // "해당사항 없음" 해제
    if (value) next.val7 = false;
    update(next);
  };

  const handleComplexToggle = (group, key, value) => {
    const nextGroup = { ...q1[group], [key]: value };
    const next = { ...q1, [group]: nextGroup };
    // "해당사항 없음" 해제
    if (value) next.val7 = false;
    update(next);
  };

  const initQuestion = value => {
    if (value) {
      update({
        val1: false,
        val2: false,
        val3Option: { left: false, right: false },
        val4Option: { left: false, right: false },
        val5: false,
        val6: false,
        val7: true,
      });
    } else {
      handleToggle('val7', false);
    }
  };

  return (
    <section>
      <h2>해당되는 습관을 선택해주세요</h2>
      <div style={{ display: 'grid', gap: 8, margin: '16px 0' }}>
        <label>
          <input
            type="checkbox"
            checked={q1.val1}
            onChange={e => handleToggle('val1', e.target.checked)}
          /> 심한 코골이
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val2}
            onChange={e => handleToggle('val2', e.target.checked)}
          /> 흡연
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val3Option.right}
            onChange={e => handleComplexToggle('val3Option', 'right', e.target.checked)}
          /> 손톱 깨물기 (오른쪽)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val3Option.left}
            onChange={e => handleComplexToggle('val3Option', 'left', e.target.checked)}
          /> 손톱 깨물기 (왼쪽)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val4Option.right}
            onChange={e => handleComplexToggle('val4Option', 'right', e.target.checked)}
          /> 껌 씹기 (오른쪽)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val4Option.left}
            onChange={e => handleComplexToggle('val4Option', 'left', e.target.checked)}
          /> 껌 씹기 (왼쪽)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val5}
            onChange={e => handleToggle('val5', e.target.checked)}
          /> 턱 괴기 (좌/우)
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val6}
            onChange={e => handleToggle('val6', e.target.checked)}
          /> 엎드려 누워 휴대폰 사용
        </label>
        <label>
          <input
            type="checkbox"
            checked={q1.val7}
            onChange={e => initQuestion(e.target.checked)}
          /> 해당사항 없음
        </label>
      </div>
    </section>
  );
}
