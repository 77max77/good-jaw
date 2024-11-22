import React from 'react';
import { useLocation } from 'react-router-dom';

function EvaluateAnalysisResultPage() {
  // 입 벌림 거리: maxHeight * 10
  // 치우침 유무: maxWidth < 1 ? 'X' : 'O'
  // 치우침 거리: maxWidth * 10

  const location = useLocation();
  const analysis = location.state?.analysisData || {};
  console.log("analysis: ", analysis)

  // Mock data for demonstration if no analysis data is provided
  const mockAnalysisData = {
    startBiasPointAverage: 0,
    maxBiasPointAverage: 0,
    createdDateTime: '2024-11-16T04:20:05.828',
  };

  // Use analysis data or fallback to mock data
  const data = {
    ...mockAnalysisData,
    ...analysis,
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2 style={{ color: '#333' }}>평가 보고서</h2>
      </header>

      <section style={sectionStyle}>
        <h5 style={titleStyle}>
          체험판 이용자님의<br />굿턱을 통한
          <span style={{ color: '#007bff' }}> 동작분석 결과</span>입니다.
        </h5>
      </section>

      <section style={sectionStyle}>
        <div style={summaryHeaderStyle}>
          <h5 style={summaryTitleStyle}>결과 요약</h5>
          <span style={summaryDateStyle}>
            검사일: {new Date(data.createdDateTime).toLocaleDateString()}
          </span>
        </div>

        <div style={{ marginTop: '10px' }}>
          <ResultRow 
            label="입 벌림 거리" 
            value={`${Math.round(data.maxHeight * 10 || 0)} mm`} 
            color="rgb(241, 94, 94)" 
          />
          <ResultRow 
            label="치우침 유무" 
            value={data.maxWidth < 1 ? 'X' : 'O'} 
          />
          <ResultRow 
            label="치우침 거리" 
            value={`${Math.round(data.maxWidth * 10 || 0)} mm`} 
          />
          <ResultRow 
            label="치우침 발생 시기" 
            value={`벌림 중 ${data.startBiasPointAverage || 0}%`} 
          />
          <ResultRow 
            label="최대 치우침 발생 시기" 
            value={`벌림 중 ${data.maxBiasPointAverage || 0}%`} 
            borderBottom={false} 
          />
        </div>
      </section>

      <section style={sectionStyle}>
        <h5 style={{ ...titleStyle, fontSize: '18px' }}>정상 수치</h5>
        <div style={{ marginTop: '5px' }}>
          <ResultRow label="입 벌림 거리" value="35mm 이상" />
          <ResultRow label="치우침 거리" value="7 ~ 10mm 미만" borderBottom={false} />
        </div>
      </section>
    </div>
  );
}

// Reusable ResultRow component
const ResultRow = ({ label, value, color = '#505050', borderBottom = true }) => (
  <div style={{ ...resultRowStyle, borderBottom: borderBottom ? '1px solid #eee' : 'none' }}>
    <span>{label}</span>
    <span style={{ color, fontWeight: 'bold' }}>{value}</span>
  </div>
);

export default EvaluateAnalysisResultPage;

// Styles
const containerStyle = {
  padding: '10px',
  fontFamily: 'Arial, sans-serif',
};

const sectionStyle = {
  padding: '5px 10px', // 기존 padding 축소
  backgroundColor: '#fff',
  marginTop: '5px', // 위쪽 여백 줄임
  borderRadius: '8px',
};

const headerStyle = {
  textAlign: 'center',
  borderBottom: '1px solid #ddd',
};

const titleStyle = {
  color: '#505050',
  fontSize: '16px',
  fontWeight: 'bold',
};

const summaryHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between', // 결과 요약과 검사일 양쪽 정렬
  alignItems: 'center',
  marginBottom: '5px', // 아래쪽 여백 최소화
};

const summaryTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#505050',
  margin: 0,
};

const summaryDateStyle = {
  fontSize: '14px',
  color: '#ADADAD',
};

const resultRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #eee',
  fontSize: '16px',
};
