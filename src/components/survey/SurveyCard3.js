import React, { useState, useEffect } from 'react';

export default function SurveyCard3({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [q3, setQ3] = useState(propSurvey.Q3);

  useEffect(() => {
    setQ3(propSurvey.Q3);
  }, [propSurvey.Q3]);

  const update = newQ3 => {
    setQ3(newQ3);
    onSurveyChange({ ...propSurvey, Q3: newQ3 });
  };

  const handleRadio = (value) => {
    update({ ...q3, val4: false, val1Option: { ...q3.val1Option, radio: value } });
  };

  const handleDate = (e) => {
    update({ ...q3, val4: false, val1Option: { ...q3.val1Option, date: e.target.value } });
  };

  const handleInput = (e) => {
    update({ ...q3, val4: false, val2Option: { ...q3.val2Option, area: e.target.value } });
  };

  const handleDate2 = (e) => {
    update({ ...q3, val4: false, val2Option: { ...q3.val2Option, date: e.target.value } });
  };

  const handleRadio3 = (value) => {
    update({ ...q3, val4: false, val3Option: { radio: value } });
  };

  const initQuestion = (value) => {
    if (value) {
      update({
        val1Option: { radio: false, date: null },
        val2Option: { area: '', date: null },
        val3Option: { radio: false },
        val4: true
      });
    } else {
      update({ ...q3, val4: false });
    }
  };

  const handleNext = () => {
    // Validation
    if (q3.val1Option.radio && !q3.val1Option.date) {
      alert('외상 시기를 선택해주세요');
      return;
    }
    if (q3.val2Option.area && !q3.val2Option.date) {
      alert('수술 관련 부위 및 시기를 모두 선택해주세요');
      return;
    }
    onNext && onNext();
  };

  return (
    <section>
      <h2>턱관절과 관련된 질병 상태 2</h2>

      <fieldset>
        <legend>외상 (얼굴 또는 턱을 다친 경험)</legend>
        <label>
          <input
            type="radio"
            name="trauma"
            checked={q3.val1Option.radio === true}
            onChange={() => handleRadio(true)}
          /> 있다
        </label>
        <label>
          <input
            type="radio"
            name="trauma"
            checked={q3.val1Option.radio === false}
            onChange={() => handleRadio(false)}
          /> 없다
        </label>
        {q3.val1Option.radio && (
          <div>
            <label>
              외상 날짜: <input type="date" value={q3.val1Option.date || ''} onChange={handleDate} />
            </label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>양악 수술 여부</legend>
        <div>
          <input
            type="text"
            placeholder="수술 부위를 입력하세요"
            value={q3.val2Option.area || ''}
            onChange={handleInput}
          />
        </div>
        {q3.val2Option.area && (
          <div>
            <label>
              수술 날짜: <input type="date" value={q3.val2Option.date || ''} onChange={handleDate2} />
            </label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>비염 또는 축농증</legend>
        <label>
          <input
            type="radio"
            name="rhinitis"
            checked={q3.val3Option.radio === true}
            onChange={() => handleRadio3(true)}
          /> 있다
        </label>
        <label>
          <input
            type="radio"
            name="rhinitis"
            checked={q3.val3Option.radio === false}
            onChange={() => handleRadio3(false)}
          /> 없다
        </label>
      </fieldset>

      <div>
        <label>
          <input
            type="checkbox"
            checked={q3.val4}
            onChange={e => initQuestion(e.target.checked)}
          /> 해당 사항 없음
        </label>
      </div>

      <button onClick={handleNext}>다음</button>
    </section>
  );
}
