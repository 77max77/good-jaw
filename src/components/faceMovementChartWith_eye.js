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

  // 색상 팔레트와 점 이름 (코, 턱, 눈 2, 입 4)
  const palette = ["#5470C6","#91CC75","#EE6666","#FAC858","#73C0DE","#3BA272","#FC8452"];
  const pointNames = [
    "noseTip","chinTip",
    "eyeLeft","eyeRight",
    "mouthLeft","mouthRight","mouthTop","mouthBottom"
  ];

  // 각 이벤트마다 Series 생성 (눈→턱 아래, 눈→코 연결 + 모든 점 scatter)
  const series = useMemo(() => events.flatMap((e, idx) => {
    const ratio = e.baseNoseLengthCM / e.baseNoseLengthPX;

    // 원본 좌표: 코, 턱 아래
    const ptsRawFace = [
      [e.noseTipX, e.noseTipY],
      [e.chinTipX, e.chinTipY],
    ];
    // 눈 좌표
    const ptsRawEyes = [
      [e.eyeCenters.left.x,  e.eyeCenters.left.y],
      [e.eyeCenters.right.x, e.eyeCenters.right.y],
    ];
    // 입 좌표
    const ptsRawMouth = [
      [e.mlX, e.mlY],
      [e.mrX, e.mrY],
      [e.mtX, e.mtY],
      [e.mbX, e.mbY],
    ];

    const ptsRaw = [...ptsRawFace, ...ptsRawEyes, ...ptsRawMouth];

    // Δ좌표 cm 변환 및 반올림
    const pts = ptsRaw.map(([x, y]) => {
      const dx = (x - ptsRawFace[0][0]) * ratio;
      const dy = (y - ptsRawFace[0][1]) * ratio;
      return [Number(dx.toFixed(1)), Number(dy.toFixed(1))];
    });

    const color = palette[idx % palette.length];
    const label = `Event ${e.round} (${e.mouthState})`;
    const symbolShape = e.mouthState === 'open' ? 'circle' : 'diamond';

    return [
      // 눈 → 턱 아래 끝
      {
        name: `${label} EyeLeftToChin`,
        type: 'line',
        data: [pts[2], pts[1]],
        showSymbol: false,
        lineStyle: { color, width: 1 }
      },
      {
        name: `${label} EyeRightToChin`,
        type: 'line',
        data: [pts[3], pts[1]],
        showSymbol: false,
        lineStyle: { color, width: 1 }
      },
      // 눈 → 코
      {
        name: `${label} EyeLeftToNose`,
        type: 'line',
        data: [pts[2], pts[0]],
        showSymbol: false,
        lineStyle: { color, width: 1, type: 'dotted' }
      },
      {
        name: `${label} EyeRightToNose`,
        type: 'line',
        data: [pts[3], pts[0]],
        showSymbol: false,
        lineStyle: { color, width: 1, type: 'dotted' }
      },
      // 점 scatter
      {
        name: `${label} Points`,
        type: 'scatter',
        data: pts.map((coord, i) => ({ value: coord, name: pointNames[i] })),
        symbol: symbolShape,
        symbolSize: 8,
        itemStyle: { color },
        emphasis: {
          label: { show: true, formatter: '{b}: {c} cm', fontSize: 10 }
        }
      }
    ];
  }), [events]);

  // 축 범위 자동 계산 및 패딩 적용
  const allCoords = series
    .filter(s => s.type === 'scatter')
    .flatMap(s => s.data.map(p => p.value));
  const xs = allCoords.map(c => c[0]);
  const ys = allCoords.map(c => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys) - 1;
  const maxY = Math.max(...ys) + 1;

  // X축에 5% 패딩 추가
  const rangeX = maxX - minX;
  const paddingX = rangeX * 0.05;
  const axisMinX = minX - paddingX;
  const axisMaxX = maxX + paddingX;

  const option = {
    title: { text: '얼굴·눈·입 위치', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: params =>
        `${params.seriesName}<br/>${params.name}<br/>ΔX: ${params.value[0]} cm<br/>ΔY: ${params.value[1]} cm`
    },
    legend: { type: 'scroll', bottom: 0, data: series.map(s => s.name) },
    xAxis: {
      type: 'value',
      name: 'X',
      min: axisMinX,
      max: axisMaxX,
      splitLine: { show: false }
    },
    yAxis: { type: 'value', name: 'Y', inverse: true, min: minY, max: maxY, splitLine: { show: false } },
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