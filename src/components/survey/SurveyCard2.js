
// SurveyCard2.js (Next.js - Pure JS)
import React, { useState, useEffect } from 'react';

export default function SurveyCard2({ survey: propSurvey, onSurveyChange, onNext, onPrev }) {
  const [q2, setQ2] = useState(propSurvey.Q2);

  useEffect(() => {
    setQ2(propSurvey.Q2);
  }, [propSurvey.Q2]);

  const update = newQ2 => {
    setQ2(newQ2);
    onSurveyChange({ ...propSurvey, Q2: newQ2 });
  };

  const toggleOpt1 = (key, value) => {
    const next = { ...q2, val3: false, val1Option: { ...q2.val1Option, [key]: value } };
    const dentalOpts = ['opt1', 'opt2', 'opt3', 'opt4'];
    if (!dentalOpts.some(opt => next.val1Option[opt])) next.val1Option.date = null;
    update(next);
  };

  const toggleOpt2 = (key, value) => {
    const next = { ...q2, val3: false, val2Option: { ...q2.val2Option, [key]: value } };
    if (!next.val2Option.opt1 && !next.val2Option.opt2) next.val2Option.date = null;
    update(next);
  };

  const handleDate1 = e => {
    update({ ...q2, val3: false, val1Option: { ...q2.val1Option, date: e.target.value } });
  };

  const handleDate2 = e => {
    update({ ...q2, val3: false, val2Option: { ...q2.val2Option, date: e.target.value } });
  };

  const initQuestion = value => {
    if (value) {
      update({
        val1Option: { opt1: false, opt2: false, opt3: false, opt4: false, date: null },
        val2Option: { opt1: false, opt2: false, opt3: false, date: null },
        val3: true
      });
    } else {
      update({ ...q2, val3: false });
    }
  };

  const handleNext = () => {
    const { val1Option, val2Option, val3 } = q2;
    if (!(
      val1Option.opt1 || val1Option.opt2 || val1Option.opt3 || val1Option.opt4 ||
      val2Option.opt1 || val2Option.opt2 || val2Option.opt3 || val2Option.opt4 ||
      val3
    )) {
      alert('최소한 1개 이상 선택 해 주세요');
      return;
    }
    if ((val1Option.opt1 || val1Option.opt2 || val1Option.opt3 || val1Option.opt4) && !val1Option.date) {
      alert('치과 진료 진단 날짜를 선택하세요.');
      return;
    }
    if ((val2Option.opt1 || val2Option.opt2) && !val2Option.date) {
      alert('턱관절 장애 진단 날짜를 선택하세요.');
      return;
    }
    onNext && onNext();
  };

  return (
    <section>
      <h2>턱관절과 관련된 질병 상태 1</h2>

      <fieldset>
        <legend>치과 진료</legend>
        <label><input type="checkbox" checked={q2.val1Option.opt1} onChange={e => toggleOpt1('opt1', e.target.checked)} /> 부정 교합</label>
        <label><input type="checkbox" checked={q2.val1Option.opt2} onChange={e => toggleOpt1('opt2', e.target.checked)} /> 치아 교정</label>
        <label><input type="checkbox" checked={q2.val1Option.opt3} onChange={e => toggleOpt1('opt3', e.target.checked)} /> 치주염 & 잇몸붓기</label>
        <label><input type="checkbox" checked={q2.val1Option.opt4} onChange={e => toggleOpt1('opt4', e.target.checked)} /> 발치</label>
        <div>
          <label>진단 날짜: <input type="date" value={q2.val1Option.date || ''} onChange={handleDate1} /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>턱관절 장애 진단</legend>
        <label><input type="checkbox" checked={q2.val2Option.opt1} onChange={e => toggleOpt2('opt1', e.target.checked)} /> 오른쪽 턱</label>
        <label><input type="checkbox" checked={q2.val2Option.opt2} onChange={e => toggleOpt2('opt2', e.target.checked)} /> 왼쪽 턱</label>
        <div>
          <label>진단 날짜: <input type="date" value={q2.val2Option.date || ''} onChange={handleDate2} /></label>
        </div>
        <label><input type="checkbox" checked={q2.val2Option.opt3} onChange={e => toggleOpt2('opt3', e.target.checked)} /> 턱관절 관련 주사(보톡스), 수술</label>
        <label><input type="checkbox" checked={q2.val2Option.opt4} onChange={e => toggleOpt2('opt4', e.target.checked)} /> 약(진통제) 복용</label>
      </fieldset>

      <div>
        <label><input type="checkbox" checked={q2.val3} onChange={e => initQuestion(e.target.checked)} /> 해당 사항 없음</label>
      </div>

      <button onClick={handleNext}>다음</button>
    </section>
  );
}

