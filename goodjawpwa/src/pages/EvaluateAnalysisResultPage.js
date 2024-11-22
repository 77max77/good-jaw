import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

function EvaluateAnalysisResultPage() {
  const router = useRouter();
  const { objectId } = router.query; 
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);

  const fetchAnalysisData = async (id) => {
    try {
      const response = await axios.get(`/api/datasave?id=${id}`);
      setAnalysisData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setAnalysisData(null);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (objectId) {
      fetchAnalysisData(objectId); 
    }
  }, [objectId]);

  if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>데이터를 불러오는 중입니다...</div>;
  if (!analysisData) return <div style={{ textAlign: 'center', padding: '20px' }}>데이터를 찾을 수 없습니다.</div>;

  const data = analysisData

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
            검사일: {new Date(data.createdAt).toLocaleDateString()}
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
          <ResultRow
            label="치우침 거리"
            value="7 ~ 10mm 미만"
            borderBottom={false}
          />
        </div>
      </section>
    </div>
  );
}

const ResultRow = ({ label, value, color = '#505050', borderBottom = true }) => (
  <div
    style={{
      ...resultRowStyle,
      borderBottom: borderBottom ? '1px solid #eee' : 'none',
    }}
  >
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
  padding: '5px 10px',
  backgroundColor: '#fff',
  marginTop: '5px',
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
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '5px',
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
