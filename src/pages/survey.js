import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import SurveyCard1 from '../components/survey/SurveyCard1';
import SurveyCard2 from '../components/survey/SurveyCard2';
import SurveyCard3 from '../components/survey/SurveyCard3';
import SurveyCard4 from '../components/survey/SurveyCard4';
import SurveyCard5 from '../components/survey/SurveyCard5';
import SurveyCard6 from '../components/survey/SurveyCard6';
import SurveyCard7 from '../components/survey/SurveyCard7';
// Load card 8 dynamically to avoid quasar dependency on server
const SurveyCard8 = dynamic(() => import('../components/survey/SurveyCard8'), { ssr: false });
import SurveyCard9 from '../components/survey/SurveyCard9';
import SurveyCard10 from '../components/survey/SurveyCard10';
import SurveyCard11 from '../components/survey/SurveyCard11';

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [survey, setSurvey] = useState({
    Q1: { val1: false, val2: false, val3Option: { left: false, right: false }, val4Option: { left: false, right: false }, val5: false, val6: false, val7: false },
    Q2: { val1Option: { opt1: false, opt2: false, opt3: false, opt4: false, date: null }, val2Option: { opt1: false, opt2: false, opt3: false, opt4: false, date: null }, val3: false },
    Q3: { val1Option: { radio: false, date: null }, val2Option: { area: '', date: null }, val3Option: { radio: false }, val4: false },
    Q4: { val1: false, val1Option: { opt1: 0 }, val2: false, val2Option: { opt1: 0 }, val3: false, val3Option: { opt1: 0 }, val4: false, val4Option: { opt1: 0 }, val5: false },
    Q5: null,
    Q6: null,
    Q7: null,
    Q8: { val1: false, val2: false, val3: false, val4: false, val5: false, val6: false, val7: false },
    Q9: null,
    Q10: null,
    Q11: null,
  });

  const stepComponents = [
    SurveyCard1,
    SurveyCard2,
    SurveyCard3,
    SurveyCard4,
    SurveyCard5,
    SurveyCard6,
    SurveyCard7,
    SurveyCard8,
    SurveyCard9,
    SurveyCard10,
    SurveyCard11,
  ];

  const CurrentCard = stepComponents[step];

  const handleSurveyChange = updated => setSurvey(updated);

  const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));

  const handleNext = () => {
    if (step < stepComponents.length - 1) {
      setStep(prev => prev + 1);
    } else {
      console.log('Final survey data:', survey);
      // TODO: submit survey via API
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/main"><Button variant="outline" size="sm">←</Button></Link>
        <h2 className="flex-1 text-center font-bold">나의 턱 평가 ({step + 1}/{stepComponents.length})</h2>
        <div className="w-6" />
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <CurrentCard
          survey={survey}
          onSurveyChange={handleSurveyChange}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>

      <div className="flex justify-between">
        <button onClick={handlePrev} disabled={step === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">이전</button>
        <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded">
          {step < stepComponents.length - 1 ? '다음' : '설문조사 완료'}
        </button>
      </div>
    </div>
  );
}
