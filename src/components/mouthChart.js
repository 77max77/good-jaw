// components/MouthMarkersChart.jsx
"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function MouthMarkersChart({ rawData }) {
  // 한 라운드당 첫 이벤트만
  const events = useMemo(() => {
    const seen = new Set();
    return rawData.filter(e => {
      if (!seen.has(e.round)) {
        seen.add(e.round);
        return true;
      }
      return false;
    });
  }, [rawData]);

  // Mediapipe FaceMesh 입 주변 인덱스
  const outerLipIdx = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
  const innerLipIdx = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];

  const series = useMemo(() => events.flatMap((e, idx) => {
    const L = e.allLandmarks;
    const ratio = e.baseNoseLengthCM / e.baseNoseLengthPX; // px → cm

    // 원시 좌표 배열 생성
    const ptsOuterRaw = outerLipIdx.map(i => [ L[i].x, L[i].y ]);
    const ptsInnerRaw = innerLipIdx.map(i => [ L[i].x, L[i].y ]);

    // 중앙점 계산 (outer+inner 모두 포함)
    const allMouthRaw = [...ptsOuterRaw, ...ptsInnerRaw];
    const center = allMouthRaw.reduce((acc, [x,y]) =>
      [ acc[0]+x, acc[1]+y ], [0,0]
    ).map(v => v / allMouthRaw.length);

    // 상대 좌표로 변환 & cm 단위 & 반올림
    const toRel = pts => pts.map(([x,y]) => [
      Number(((x - center[0]) * ratio).toFixed(1)),
      Number(((y - center[1]) * ratio).toFixed(1)),
    ]);

    const ptsOuter = toRel(ptsOuterRaw);
    const ptsInner = toRel(ptsInnerRaw);

    // 폐곡선 닫기
    const closedOuter = [...ptsOuter, ptsOuter[0]];
    const closedInner = [...ptsInner, ptsInner[0]];

    const color = ["#5470C6","#91CC75","#EE6666","#FAC858","#73C0DE"][idx % 5];
    const label = `Event ${e.round} (${e.mouthState})`;

    return [
      // ─── Outer Lip ───────────────────
      {
        name: `${label} Outer Lip`,
        type: "line",
        data: closedOuter,
        lineStyle: { color, width: 2 },
        showSymbol: false,
      },
      // ─── Inner Lip ───────────────────
      {
        name: `${label} Inner Lip`,
        type: "line",
        data: closedInner,
        lineStyle: { color, width: 1.5, type: "dashed" },
        showSymbol: false,
      },
    ];
  }), [events]);

  // 축 범위 자동 계산
  const allCoords = series.flatMap(s => s.data);
  const xs = allCoords.map(p => p[0]), ys = allCoords.map(p => p[1]);
  const minX = Math.min(...xs) - 1, maxX = Math.max(...xs) + 1;
  const minY = Math.min(...ys) - 1, maxY = Math.max(...ys) + 1;

  const option = {
    title: { text: '입모양 변형', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: param =>
        `${param.seriesName}<br/>ΔX: ${param.value[0]} <br/>ΔY: ${param.value[1]} `
    },
    legend: { type: 'scroll', bottom: 0, data: series.map(s => s.name) },
    xAxis: { type: 'value', name: 'ΔX ', min: minX, max: maxX, splitLine: { show: false } },
    yAxis: { type: 'value', name: 'ΔY ', inverse: true, min: minY, max: maxY, splitLine: { show: false } },
    series
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

MouthMarkersChart.propTypes = {
  rawData: PropTypes.arrayOf(PropTypes.shape({
    round: PropTypes.number.isRequired,
    mouthState: PropTypes.string,
    allLandmarks: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })).isRequired,
    baseNoseLengthCM: PropTypes.number.isRequired,
    baseNoseLengthPX: PropTypes.number.isRequired,
  })).isRequired,
};
