"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function FaceMovementChart({ rawData }) {
  // 라운드별 첫 이벤트 필터링
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

  // 색상 팔레트 및 포인트 이름
  const palette = ["#5470C6","#91CC75","#EE6666","#FAC858","#73C0DE","#3BA272","#FC8452"];
  const pointNames = ["noseTip","leftJawStart","chinTip","rightJawStart"];

  // 이벤트별 시리즈 생성: px->cm 변환 후 델타 좌표, 소수점 1자리
  const series = useMemo(() => events.flatMap((e, idx) => {
    // px->cm 비율 (사용자 측정된값 기반)
    const ratio = e.baseNoseLengthCM / e.baseNoseLengthPX;

    // 원점 기준 px 좌표
    const ptsRaw = [
      [e.noseTipX, e.noseTipY],
      [e.leftJawStartX, e.leftJawStartY],
      [e.chinTipX, e.chinTipY],
      [e.rightJawStartX, e.rightJawStartY],
    ];

    // px 델타 -> cm 델타 변환 & 소수점 1자리
    const pts = ptsRaw.map(([x,y], i) => {
      const dx = (x - ptsRaw[0][0]) * ratio;
      const dy = (y - ptsRaw[0][1]) * ratio;
      return [Number(dx.toFixed(1)), Number(dy.toFixed(1))];
    });

    // 닫힌 폴리라인
    const shapeData = [...pts, pts[0]];
    const color = palette[idx % palette.length];
    const label = `Event ${e.round} (${e.mouthState})`;
    const symbolShape = e.mouthState === 'open' ? 'circle' : 'diamond';

    return [
      {
        name: `${label} Shape`,
        type: "line",
        data: shapeData,
        lineStyle: { color, width: 2 },
        showSymbol: false,
        emphasis: { lineStyle: { width: 3 } },
      },
      {
        name: `${label} Points`,
        type: "scatter",
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

  // 축 범위: cm 델타 기준
  const allCoords = useMemo(() => series
    .filter(s => s.type === 'scatter')
    .flatMap(s => s.data.map(p => p.value)),
  [series]);
  const xs = allCoords.map(c => c[0]);
  const ys = allCoords.map(c => c[1]);
  const minX = Math.min(...xs) - 1;
  const maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1;
  const maxY = Math.max(...ys) + 1;

  const option = {
    title: { text: '6회 이벤트 얼굴 랜드마크 (cm)', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: params =>
        `${params.seriesName}<br/>${params.name}<br/>ΔX: ${params.value[0].toFixed(1)} cm<br/>ΔY: ${params.value[1].toFixed(1)} cm`
    },
    legend: { type: 'scroll', bottom: 0, data: series.map(s => s.name) },
    xAxis: {
      type: 'value', name: 'ΔX (cm)', min: minX, max: maxX,
      axisLabel: { formatter: val => `${val.toFixed(1)}` },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value', name: 'ΔY (cm)', inverse: true, min: minY, max: maxY,
      axisLabel: { formatter: val => `${val.toFixed(1)}` },
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
