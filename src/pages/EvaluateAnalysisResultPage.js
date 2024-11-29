import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// ECharts 컴포넌트 동적 로딩
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

function EvaluateAnalysisResultPage() {
  const router = useRouter();
  const { objectId } = router.query; 
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  
  const array1 = [
    [0.0, 0.0], 
    [0.005856938895846758, -0.008585165286763384], 
    [0.006836124153849245, -0.00920887307144358], 
    [0.015586790662592, -0.020572209506733212], 
    [0.0018065754214238036, -0.02477648196506435],
  
    [0.013827250340897573, -0.01808890034643779], 
    [0.015413615977224748, -0.017530446558387515], 
    [0.02298947397227238, -0.03724646609914665], 
    [0.027661983538570276, -0.04227200800042727], 
    [0.026892318270271377, -0.0436942729598131],
  
    [0.02796343576865401, -0.04468262464640308], 
    [0.05378463654054275, -0.0641656101735928], 
    [0.053794257356396494, -0.0617046297965511], 
    [0.057727033081496, -0.05831272068055044], 
    [0.07079637692902702, -0.07446592793204097],
  
    [0.07088082631263204, -0.07356844926155078], 
    [0.06620831674633414, -0.07050622337373967], 
    [0.04942854491787885, -0.0495899679832636], 
    [0.051082256265182174, -0.051474075447335045], 
    [0.05102560034959906, -0.22116918296649576],
  
    [0.038460814844619544, -0.499042942967372], 
    [0.03307529592560586, -0.6162143007490056], 
    [0.09239297056158625, -0.9113930440448104], 
    [0.09379440273761383, -1.3536610346517222], 
    [0.14501562634290555, -1.7072074038839717],
  
    [0.17056530631181105, -2.04834095783256], 
    [0.17143866259542245, -2.2000924827355797], 
    [0.18737500956736686, -2.3208757070017736], 
    [0.23666244918605758, -2.444948785372142], 
    [0.2463570246280058, -2.507031435727196],
  
    [0.287699808310589, -2.594186655767941], 
    [0.32096003769649445, -2.672632847530082], 
    [0.40690919959515603, -2.9103710639894302], 
    [0.4636880478252894, -3.076332967577183], 
    [0.5630112127401836, -3.1326372611465603],
  
    [0.5143801265586255, -3.1207354133575724], 
    [0.484006141928841, -3.1434609289219835], 
    [0.4754168913305331, -3.112291665132246], 
    [0.5082270803303915, -3.148319351573345], 
    [0.48049240618314865, -3.1696475549268324],
  
    [0.45670654245409475, -3.223840942615256], 
    [0.4453529107671467, -3.2108141107768304], 
    [0.44347898963474675, -3.207573363822993], 
    [0.4376551891046184, -3.2415685316337175], 
    [0.42722836267824693, -3.2433434923873015],
  
    [0.48362665419238804, -3.2649093408710432], 
    [0.48819761070245205, -3.2680924778813214], 
    [0.4854952304270915, -3.3295906143343528], 
    [0.4854695749181482, -3.3529902413634116], 
    [0.49164827665532546, -3.382845608686763],
  
    [0.4855721969539214, -3.4575661632663515], 
    [0.4828869203511897, -3.4734282260874014], 
    [0.46707991990350106, -3.473954398212805], 
    [0.4676732035478148, -3.4666323300023776], 
    [0.4751410946093927, -3.465631567563981],
  
    [0.47508016277565235, -3.451205974558229], 
    [0.4470739678254262, -3.4478630119027174], 
    [0.4410214056738868, -3.443525436658501], 
    [0.44454796917405076, -3.4422679769106574], 
    [0.4368288679207364, -3.4049367245522904],
  
    [0.4237092820348581, -3.400923790186482], 
    [0.42241474781276095, -3.399850550221742], 
    [0.4218813270226482, -3.382223794246159], 
    [0.4252047844103444, -3.3480302118406087], 
    [0.4052554882478527, -3.337565140609124],
  
    [0.3885729935574741, -3.3256687726948653], 
    [0.3256036848152311, -3.3053946318064327], 
    [0.32157149399297635, -3.3005868095276973], 
    [0.3024570708506811, -3.294925984457559], 
    [0.324854330158179, -3.314952718792481],
  
    [0.3683511076124598, -3.2758289165559673], 
    [0.306289362499086, -3.068384348780403], 
    [0.2389254788707642, -2.6672076010943835], 
    [0.22186991032116846, -2.2811632841043505], 
    [0.1676288195173429, -1.4906928505232704],
  
    [0.0006478016008182396, -0.8875568442171902], 
    [0.1063987404855476, -0.4390956372209103], 
    [0.11611041960012468, -0.35161057723425254], 
    [0.11160787778057611, -0.19907526757200422], 
    [0.09109202246225326, -0.09214530345125421],
  ];
  

  // 서버에서 데이터 가져오기
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

  const data = analysisData;

  // 그래프 데이터 처리
  const processGraphData = (array = []) => {
    if (!Array.isArray(array) || array.length === 0) {
      return { dataOpen: [], dataClose: [] };
    }
  
    const minY = Math.min.apply(null, array.map(el => el[1])); // 최소 Y 값을 계산 // minY = -3.473954398212805
    let centerIndex = -1; // 중심 인덱스 초기화
    const dataOpen = [];
    const dataClose = [];
  
    // 중심 인덱스를 찾고 Y 값을 조정
    array.forEach((el, index) => {
      if (el[1] === minY) {
        centerIndex = index;
      }
      el[1] = Math.abs(minY) - Math.abs(el[1]); // Y 값 조정
    });
    console.log("centerIndex:", centerIndex) // centerIndex: 52
    console.log("centerIndex Y:", array[centerIndex])
  
    const centerX = array[centerIndex][0]; // 중심 X 좌표 계산 [0.46707991990350106]
  
    // 데이터 조정 및 분리
    array.forEach((el, index) => {
      el[0] = el[0] - centerX; // X 좌표 조정
      if (index <= centerIndex) {
        dataOpen.push(el);
      } else {
        dataClose.push(el);
      }
    });
  
    return { dataOpen, dataClose };
  };
  
  
  // 그래프 옵션 생성 함수
  const generateGraphOptions = (title, array) => {
    const { dataOpen, dataClose } = processGraphData(array);
  
    return {
      title: { 
        text: title,
        left: "center",
        textStyle: {
          fontSize: 15
        },
        padding: [20, 0, 5, 0] },
      xAxis: {
       
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false
        }
      },
      series: [
        {
          type: "line",
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: '#18A8F1',
            width: 3,
            shadowColor: "rgba(0,0,0,0.3)",
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          data: dataOpen
        }, 
        {
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: '#F36969',
            width: 3,
            shadowColor: "rgba(0,0,0,0.3)",
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          data: dataClose
        },
      ],
    };
  };
  

  const graphOptions1 = generateGraphOptions('첫 번째 동작 분석', array1 || []);
  const graphOptions2 = generateGraphOptions('두 번째 동작 분석', data.array2 || []);
  const graphOptions3 = generateGraphOptions('세 번째 동작 분석', data.array3 || []);

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

      {/* 그래프 추가 섹션 */}
      <section style={sectionStyle}>
        <ReactECharts option={graphOptions1} style={{ height: 400 }} />
      </section>
      <section style={sectionStyle}>
        <ReactECharts option={graphOptions2} style={{ height: 400 }} />
      </section>
      <section style={sectionStyle}>
        <ReactECharts option={graphOptions3} style={{ height: 400 }} />
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