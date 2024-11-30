import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {generateGraphOptions} from '../utils/index';

// ECharts 컴포넌트 동적 로딩
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function EvaluateAnalysisResultPage() {
  const router = useRouter();
  const { objectId } = router.query; 
  // const [isLoading, setIsLoading] = useState(true);
  // const [analysisData, setAnalysisData] = useState(null);
  const [graphData, setGrahData] = useState([]);
  const [infoData,setInfoData] = useState([]);
  
  // 서버에서 데이터 가져오기: 로컬에서 가져와도 됨.
  // const fetchData = async (id) => {
  //   try {
  //     const response = await axios.get(`/api/rawDataSaveDB?id=${id}`);
  //     console.log("response:",response.data.data)
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   } finally {

  //   }
  // };
  useEffect(() => {
    setGrahData(JSON.parse(localStorage.getItem('graphData')));
    setInfoData(JSON.parse(localStorage.getItem('maxXY')));  
  },[]);

  useEffect(() => {
    if (objectId) {
      // fetchData(objectId);
    }
  }, [objectId]);

 
  let graphDataArray = new Array(6).fill([]);
  let currentRound = 1;
  graphDataArray[currentRound-1] = [];
  for(let i=0; i<graphData.length; i++){
    console.log("dataArray:",graphData[i])

    if(graphData[i].round === currentRound){
      graphDataArray[currentRound-1].push([graphData[i].lengthWeightCM,graphData[i].lengthHeightCM])
    }else{
      console.log("graphDataArray[currentRound-1]:", graphDataArray[currentRound-1])

      currentRound = graphData[i].round
      graphDataArray[currentRound-1] = [];
      graphDataArray[currentRound-1].push([graphData[i].lengthWeightCM,graphData[i].lengthHeightCM])
    }
  }
  const graphOptions= []

  for(let i=0; i<graphDataArray.length; i=i+2){
    graphOptions.push(generateGraphOptions(`${Math.ceil((i+1)/2)} 번째 동작 분석`, graphDataArray[i], graphDataArray[i+1]))
  }

  const summaryData = {
    maxHeight: Math.max(...infoData.map(data => data.maxHeight)),
    maxWidth: Math.max(...infoData.map(data => data.maxWidth)),
    minWidth: Math.min(...infoData.map(data => data.minWidth)),
    minHeight: Math.min(...infoData.map(data => data.minHeight)),
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
            검사일: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div style={{ marginTop: '10px' }}>
          <ResultRow
            label="입 벌림 거리"
            value={`${Math.round((summaryData.maxHeight-summaryData.minHeight) * 10 || 0)} mm`}
            color="rgb(241, 94, 94)"
          />
          <ResultRow
            label="치우침 유무"
            value={(summaryData.maxWidth-summaryData.minWidth)< 1 ? 'X' : 'O'}
          />
          <ResultRow
            label="치우침 거리"
            value={`${Math.round((summaryData.maxWidth-summaryData.minWidth)* 10 || 0)} mm`}
          />
          <ResultRow
            label="치우침 발생 시기"
            // value={`벌림 중 ${data.startBiasPointAverage || 0}%`}
          />
          <ResultRow
            label="최대 치우침 발생 시기"
            // value={`벌림 중 ${data.maxBiasPointAverage || 0}%`}
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

      {/* 그래프 추가 섹션 */}
      {graphOptions.map((graphOption, index) => (
        <section key={index} style={sectionStyle}>
          <ReactECharts option={graphOption} style={{ height: 400 }} />
        </section>
      ))}
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

// 스타일 정의
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