"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function FaceMovementChart({ rawData }) {
  // 라운드별 첫 이벤트만 필터링
  const events = useMemo(() => {
    const seen = new Set();
    return rawData.filter(item => {
      if (!seen.has(item.round)) {
        seen.add(item.round);
        return true;
      }
      return false;
    });
  }, [rawData]);

  // 색상 팔레트, 포인트 이름 (4 face + 2 eyes + 4 mouth)
  const palette    = ["#5470C6","#91CC75","#EE6666","#FAC858","#73C0DE","#3BA272","#FC8452"];
  const pointNames = [
    "noseTip","leftJawStart","chinTip","rightJawStart",
    "eyeLeft","eyeRight",
    "mouthLeft","mouthRight","mouthTop","mouthBottom"
  ];

  // 각 이벤트마다 Series 생성
  const series = useMemo(() => events.flatMap((e, idx) => {
    const ratio = e.baseNoseLengthCM / e.baseNoseLengthPX;

    // 1) 얼굴 주요점 4
    const ptsRawFace = [
      [e.noseTipX,      e.noseTipY],
      [e.leftJawStartX, e.leftJawStartY],
      [e.chinTipX,      e.chinTipY],
      [e.rightJawStartX,e.rightJawStartY],
    ];
    // 2) 눈 중심 2
    const ptsRawEyes = [
      [e.eyeCenters.left.x,  e.eyeCenters.left.y],
      [e.eyeCenters.right.x, e.eyeCenters.right.y],
    ];
    // 3) 입 모양 4
    const ptsRawMouth = [
      [e.mlX, e.mlY],
      [e.mrX, e.mrY],
      [e.mtX, e.mtY],
      [e.mbX, e.mbY],
    ];

    // 합치기
    const ptsRaw = [...ptsRawFace, ...ptsRawEyes, ...ptsRawMouth];

    // Δ 좌표 cm 변환 & 반올림
    const pts = ptsRaw.map(([x, y]) => {
      const dx = (x - ptsRawFace[0][0]) * ratio;
      const dy = (y - ptsRawFace[0][1]) * ratio;
      return [ Number(dx.toFixed(1)), Number(dy.toFixed(1)) ];
    });

    // 얼굴 윤곽 닫힌 선
    const faceShape  = [...pts.slice(0,4), pts[0]];
    // 입 모양 닫힌 선
    const mouthShape = [...pts.slice(6,10), pts[6]];

    const color = palette[idx % palette.length];
    const label = `Event ${e.round} (${e.mouthState})`;
    const symbolShape = e.mouthState === 'open' ? 'circle' : 'diamond';

    return [
     // 눈 ↔ 코
{
    name: `${label} EyeToNoseLeft`,
    type: 'line',
    data: [ pts[4], pts[0] ],        // eyeLeft → noseTip
    showSymbol: false,
    lineStyle: { color, width: 1, type: 'dotted' },
  },
  {
    name: `${label} EyeToNoseRight`,
    type: 'line',
    data: [ pts[5], pts[0] ],        // eyeRight → noseTip
    showSymbol: false,
    lineStyle: { color, width: 1, type: 'dotted' },
  },
  
  // 눈 ↔ 양쪽 턱끝
  {
    name: `${label} EyeLeftToJawLeft`,
    type: 'line',
    data: [ pts[4], pts[1] ],        // eyeLeft → leftJawStart
    showSymbol: false,
    lineStyle: { color, width: 1 },
  },
  {
    name: `${label} EyeRightToJawRight`,
    type: 'line',
    data: [ pts[5], pts[3] ],        // eyeRight → rightJawStart
    showSymbol: false,
    lineStyle: { color, width: 1 },
  },
  
  // 양쪽 턱끝 ↔ 턱 아래(chinTip)
  {
    name: `${label} JawLeftToChin`,
    type: 'line',
    data: [ pts[1], pts[2] ],        // leftJawStart → chinTip
    showSymbol: false,
    lineStyle: { color, width: 1 },
  },
  {
    name: `${label} JawRightToChin`,
    type: 'line',
    data: [ pts[3], pts[2] ],        // rightJawStart → chinTip
    showSymbol: false,
    lineStyle: { color, width: 1 },
  },
  
      // 포인트 스캐터
      {
        name: `${label} Points`,
        type: "scatter",
        data: pts.map((coord, i) => ({
          value: coord,
          name: pointNames[i],
        })),
        symbol: symbolShape,
        symbolSize: 8,
        itemStyle: { color },
        emphasis: {
          label: { show: true, formatter: '{b}: {c} cm', fontSize: 10 }
        }
      }
    ];
  }), [events]);

  // 축 범위 자동 계산
  const allCoords = series
    .filter(s => s.type === 'scatter')
    .flatMap(s => s.data.map(p => p.value));
  const xs = allCoords.map(c => c[0]), ys = allCoords.map(c => c[1]);
  const minX = Math.min(...xs) - 1, maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1, maxY = Math.max(...ys) + 1;

  const option = {
    title: { text: '이벤트별 얼굴·눈·입 위치 (cm)', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: params =>
        `${params.seriesName}<br/>${params.name}<br/>ΔX: ${params.value[0]} cm<br/>ΔY: ${params.value[1]} cm`
    },
    legend: { type: 'scroll', bottom: 0, data: series.map(s => s.name) },
    xAxis: {
      type: 'value',
      name: 'ΔX (cm)',
      min: minX,
      max: maxX,
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'ΔY (cm)',
      inverse: true,
      min: minY,
      max: maxY,
      splitLine: { show: false }
    },
    series
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

FaceMovementChart.propTypes = {
  rawData: PropTypes.arrayOf(PropTypes.object).isRequired,
};
