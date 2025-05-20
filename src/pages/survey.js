// pages/survey.js
import { useState } from 'react';
import { questions } from '../lib/data/questions';
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = questions[step];

  const handleChange = (value, option) => {
    // 복수선택 처리
    if (q.multiple) {
      const prev = answers[q.id] || [];
      const next = prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option];
      setAnswers({ ...answers, [q.id]: next });
    } else {
      setAnswers({ ...answers, [q.id]: value });
    }
  };

  const renderOptions = () => {
    return q.options.map(opt => (
      <label key={opt} className="flex items-center mb-2">
        <input
          type={q.multiple ? 'checkbox' : 'radio'}
          name={`q${q.id}`}
          value={opt}
          checked={
            q.multiple
              ? (answers[q.id] || []).includes(opt)
              : answers[q.id] === opt
          }
          onChange={() => handleChange(opt, opt)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <span className="ml-2">{opt}</span>
      </label>
    ));
  };

  const renderQuestion = () => {
    switch (q.type) {
      case 'info':
        return (
          <div className="prose mb-6 whitespace-pre-line">
            {q.content}
            {q.image && (
              <img src={q.image} alt="" className="mt-4 rounded shadow" />
            )}
          </div>
        );

      case 'multipleChoice':
      case 'checkbox':
        return (
          <>
            <p className="font-medium mb-4">{q.question}</p>
            {renderOptions()}
          </>
        );

      case 'radio':
        return (
          <>
            <p className="font-medium mb-4">{q.question}</p>
            {renderOptions()}
          </>
        );

      case 'text':
        return (
          <>
            <p className="font-medium mb-2">{q.question}</p>
            <input
              type="text"
              placeholder={q.placeholder}
              value={answers[q.id] || ''}
              onChange={e => handleChange(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </>
        );

      case 'date':
        return (
          <>
            <p className="font-medium mb-2">{q.question}</p>
            <input
              type="date"
              value={answers[q.id] || ''}
              onChange={e => handleChange(e.target.value)}
              className="p-2 border rounded"
            />
          </>
        );

      case 'slider':
        return (
          <>
            <p className="font-medium mb-2">{q.question}</p>
            <input
              type="range"
              min={q.min}
              max={q.max}
              value={answers[q.id] ?? q.min}
              onChange={e => handleChange(e.target.value)}
              className="w-full"
            />
            <div className="text-right">{answers[q.id] ?? q.min}</div>
          </>
        );

      case 'painScale':
        return (
          <>
            <p className="font-medium mb-2">{q.question}</p>
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: q.max + 1 }, (_, i) => (
                <label key={i} className="flex items-center">
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    value={i}
                    checked={answers[q.id] == i}
                    onChange={() => handleChange(i)}
                    className="form-radio h-5 w-5"
                  />
                  <span className="ml-1">{i}</span>
                </label>
              ))}
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <p className="font-medium mb-2">{q.question}</p>
            <video
              src={q.src}
              controls
              className="w-full rounded shadow mb-4"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* 상단 바 */}
      <div className="flex items-center mb-6">
      <Link href="/main"><Button variant="outline" size="sm">←</Button></Link>
        <h2 className="flex-1 text-center font-bold">{q.title || '나의 턱 평가'}</h2>
        <div className="w-6" />
      </div>

      {/* 진행도 */}
      {q.stepLabel && (
        <div className="text-center text-blue-600 font-semibold mb-4">
          {q.stepLabel}
        </div>
      )}

      {/* 질문/컨텐츠 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">{renderQuestion()}</div>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(s => Math.max(s - 1, 0))}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          이전
        </button>

        {step < questions.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            다음
          </button>
        ) : (
          <button
            onClick={() => {
              console.log('최종 답변:', answers);
              // TODO: Submit to API
            }}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            설문조사 완료
          </button>
        )}
      </div>
    </div>
  );
}
