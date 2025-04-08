"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { MouthOpeningChart } from '@/components/mouth-opening-chart'
import { DeviationChart } from '@/components/deviation-chart'
import { ProgressChart } from '@/components/progress-chart'
import { generateGraphOptions } from '../utils/index'
import { maxRound } from '@/utils/constants'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

export function AnalysisResults() {
  // localStorage에서 저장된 데이터 가져오기
  const [graphData, setGraphData] = useState([])
  const [infoData, setInfoData] = useState([])

  useEffect(() => {
    const storedGraphData = localStorage.getItem('graphData')
    const storedInfoData = localStorage.getItem('maxXY')
    if (storedGraphData) setGraphData(JSON.parse(storedGraphData))
    if (storedInfoData) setInfoData(JSON.parse(storedInfoData))
  }, [])

  // infoData를 기반으로 summaryData 계산
  let summaryData = null
  if (infoData && infoData.length > 0) {
    summaryData = {
      maxHeight: Math.max(...infoData.map((data) => data.maxHeight)),
      maxWidth: Math.max(...infoData.map((data) => data.maxWidth)),
      minWidth: Math.min(...infoData.map((data) => data.minWidth)),
      minHeight: Math.min(...infoData.map((data) => data.minHeight)),
      maxWidthIndex: infoData.findIndex(
        (data) => data.maxWidth === Math.max(...infoData.map((d) => d.maxWidth))
      ),
      totalCount: infoData.length,
    }
  }

  const analysisData = summaryData
    ? {
        testDate: new Date().toLocaleDateString(),
        mouthOpeningDistance: Math.round((summaryData.maxHeight - summaryData.minHeight) * 10) || 0,
        hasDeviation: summaryData.maxWidth - summaryData.minWidth < 1 ? false : true,
        deviationDistance: Math.round((summaryData.maxWidth - summaryData.minWidth) * 10) || 0,
        maxDeviationTime: `벌림 중 ${(((summaryData.maxWidthIndex + 1) / summaryData.totalCount) * 100).toFixed(
          0
        )}%`,
        normalValues: {
          mouthOpeningDistance: 35,
          deviationDistanceMin: 7,
          deviationDistanceMax: 10,
        },
      }
    : {
        testDate: '-',
        mouthOpeningDistance: 0,
        hasDeviation: false,
        deviationDistance: 0,
        maxDeviationTime: '-',
        normalValues: {
          mouthOpeningDistance: 35,
          deviationDistanceMin: 7,
          deviationDistanceMax: 10,
        },
      }

  const isNormalMouthOpening =
    analysisData.mouthOpeningDistance >= analysisData.normalValues.mouthOpeningDistance

  // ───────────────────────────────────────────────────────────────
  // 기존 차트에 사용할 graphOptions 생성 (라운드별 측정값)
  let graphOptions = []
  if (graphData && graphData.length > 0) {
    let graphDataArray = new Array(maxRound).fill(null).map(() => [])
    let currentRound = 1
    for (let i = 0; i < graphData.length; i++) {
      if (graphData[i].round === currentRound) {
        graphDataArray[currentRound - 1].push([graphData[i].lengthXcm, graphData[i].lengthYcm])
      } else {
        currentRound = graphData[i].round
        if (!graphDataArray[currentRound - 1]) graphDataArray[currentRound - 1] = []
        graphDataArray[currentRound - 1].push([graphData[i].lengthXcm, graphData[i].lengthYcm])
      }
    }
    for (let i = 0; i < graphDataArray.length; i += 2) {
      const roundLabel = `${Math.ceil((i + 1) / 2)} 번째 동작 분석`
      const openData = graphDataArray[i] || []
      const closeData = graphDataArray[i + 1] || []
      graphOptions.push(generateGraphOptions(roundLabel, openData, closeData))
    }
  }

  // ───────────────────────────────────────────────────────────────
  // [추가] 각 라운드의 턱(chinTip) 좌표 평균값 계산 (입 열림/닫힘)
  // 데이터에는 mouthState(또는 action)가 있고, "open"/"closed" 형태로 들어있다고 가정
  const groupedByRoundAndState = {}
  graphData.forEach((item) => {
    // mouthState 혹은 action 중 하나를 사용하세요.
    const state = item.mouthState || item.action // 'open' 또는 'closed'
    const round = item.round
    if (!groupedByRoundAndState[round]) {
      groupedByRoundAndState[round] = { open: [], closed: [] }
    }
    if (state === 'open') {
      groupedByRoundAndState[round].open.push([item.chinTipX, item.chinTipY])
    } else if (state === 'closed') {
      groupedByRoundAndState[round].closed.push([item.chinTipX, item.chinTipY])
    }
  })

  const averageChinByRound = {}
  Object.keys(groupedByRoundAndState).forEach((round) => {
    const group = groupedByRoundAndState[round]
    averageChinByRound[round] = {}
    // open
    if (group.open.length > 0) {
      const sum = group.open.reduce(
        (acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]],
        [0, 0]
      )
      averageChinByRound[round].open = [sum[0] / group.open.length, sum[1] / group.open.length]
    }
    // closed
    if (group.closed.length > 0) {
      const sum = group.closed.reduce(
        (acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]],
        [0, 0]
      )
      averageChinByRound[round].closed = [sum[0] / group.closed.length, sum[1] / group.closed.length]
    }
  })

  // [핵심 수정] 홀수 라운드는 closed, 짝수 라운드는 open으로 짝을 맞춤
  // 라운드를 오름차순 정렬 후 2개씩 묶어서 pairedAvgChin 배열에 저장
  const rounds = Object.keys(averageChinByRound)
    .map(Number)
    .sort((a, b) => a - b)

  const pairedAvgChin = []
  for (let i = 0; i < rounds.length; i += 2) {
    const closedRound = rounds[i]     // 홀수 라운드(1, 3, 5...)
    const openRound   = rounds[i + 1] // 짝수 라운드(2, 4, 6...)

    if (
      averageChinByRound[closedRound] &&
      averageChinByRound[closedRound].closed &&
      averageChinByRound[openRound] &&
      averageChinByRound[openRound].open
    ) {
      // i/2는 0부터 시작하므로, 실제 표시용 pair는 (i/2)+1
      pairedAvgChin.push({
        pair: (i / 2) + 1,
        closed: averageChinByRound[closedRound].closed,
        open: averageChinByRound[openRound].open,
      })
    }
  }

  // open/closed별 좌표 배열 & 두 점을 연결하는 line data
  const avgOpenPoints = pairedAvgChin.map((item) => item.open)
  const avgClosedPoints = pairedAvgChin.map((item) => item.closed)
  const avgLines = pairedAvgChin.map((item) => [item.closed, item.open]) // closed → open 순서로 연결

  // 전체 평균 좌표의 축 범위 계산 (여유 공간 10% 추가)
  const allAvgPoints = [...avgOpenPoints, ...avgClosedPoints]
  const avgAllX = allAvgPoints.map((pt) => pt[0])
  const avgAllY = allAvgPoints.map((pt) => pt[1])
  const avgXMin = allAvgPoints.length ? Math.min(...avgAllX) : 0
  const avgXMax = allAvgPoints.length ? Math.max(...avgAllX) : 100
  const avgYMin = allAvgPoints.length ? Math.min(...avgAllY) : 0
  const avgYMax = allAvgPoints.length ? Math.max(...avgAllY) : 100
  const avgMarginX = (avgXMax - avgXMin) * 1; // 30% 여유
  const avgMarginY = (avgYMax - avgYMin) * 1;

  // ECharts 옵션: 입 열림/닫힘 평균 턱 좌표 비교
  const chinComparisonAvgOption = {
    title: {
      text: '입 열림/닫힘 평균 턱 좌표 비교',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.seriesName}<br/>X: ${params.value[0].toFixed(
          2
        )} px<br/>Y: ${params.value[1].toFixed(2)} px`
      },
    },
    legend: {
      data: ['Closed Average', 'Open Average'],
      bottom: 0,
    },
    xAxis: {
      name: 'X (px)',
      type: 'value',
      min: avgXMin - avgMarginX,
      max: avgXMax + avgMarginX,
      axisLabel: {
        formatter: (value) => value.toFixed(0),  // 소수점 제거
      },
    },
    yAxis: {
      name: 'Y (px)',
      type: 'value',
      min: avgYMin - avgMarginY,
      max: avgYMax + avgMarginY,
      axisLabel: {
        formatter: (value) => value.toFixed(0),  // 소수점 제거
      },
    },
    series: [
      {
        name: 'Closed Average',
        type: 'scatter',
        symbol: 'triangle',
        symbolSize: 10,
        data: avgClosedPoints,
        itemStyle: { color: '#2F9C0A' },
      },
      {
        name: 'Open Average',
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 10,
        data: avgOpenPoints,
        itemStyle: { color: '#F56C6C' },
      },
      // dashed 라인
      ...avgLines.map((lineData, idx) => ({
        name: `Pair ${idx + 1}`,
        type: 'line',
        data: lineData,
        showSymbol: false,
        lineStyle: { type: 'dashed', color: '#888' },
      })),
    ],
  }
  // ───────────────────────────────────────────────────────────────

  // 기존 "턱-코 좌표 연결 시각화" 옵션
  let allX = []
  let allY = []
  graphData.forEach(item => {
    allX.push(item.chinTipX, item.noseTipX)
    allY.push(item.chinTipY, item.noseTipY)
  })
  const computedXMin = allX.length ? Math.min(...allX) : 0
  const computedXMax = allX.length ? Math.max(...allX) : 100
  const computedYMin = allY.length ? Math.min(...allY) : 0
  const computedYMax = allY.length ? Math.max(...allY) : 100
  const compMarginX = (computedXMax - computedXMin) * 0.5
  const compMarginY = (computedYMax - computedYMin) * 0.5

  const coordinatesOption = {
    title: {
      text: '턱-코 좌표 연결 시각화',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `${params.seriesName}<br/>X: ${params.value[0].toFixed(2)} px<br/>Y: ${params.value[1].toFixed(2)} px`
      },
    },
    legend: {
      data: ['Chin Tip', 'Nose Tip'],
      bottom: 0,
    },
    xAxis: {
      name: 'X (px)',
      type: 'value',
      min: computedXMin - compMarginX,
      max: computedXMax + compMarginX,
      axisLabel: {
        formatter: (value) => value.toFixed(0),  // 소수점 제거
      },
    },
    yAxis: {
      name: 'Y (px)',
      type: 'value',
      min: computedYMin - compMarginY,
      max: computedYMax + compMarginY,
      axisLabel: {
        formatter: (value) => value.toFixed(0),  // 소수점 제거
      },
    },
    series: [
      {
        name: 'Chin Tip',
        type: 'scatter',
        symbolSize: 8,
        data: graphData.map(item => [item.chinTipX, item.chinTipY]),
        itemStyle: { color: 'red' },
      },
      {
        name: 'Nose Tip',
        type: 'scatter',
        symbolSize: 8,
        data: graphData.map(item => [item.noseTipX, item.noseTipY]),
        itemStyle: { color: 'blue' },
      },
      ...graphData.map((item) => ({
        name: `Round ${item.round} (Chin-Nose)`,
        type: 'line',
        data: [
          [item.chinTipX, item.chinTipY],
          [item.noseTipX, item.noseTipY]
        ],
        showSymbol: false,
        lineStyle: {
          type: 'dashed',
          color: '#888'
        }
      }))
    ]
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl font-bold">굿턱을 통한 동작분석 결과</CardTitle>
          <CardDescription>체험판 이용자님의 분석 결과입니다</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">결과 요약</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">검사일:</span>
                  <span className="font-medium">{analysisData.testDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">입 벌림 거리:</span>
                  <span className={`font-medium ${isNormalMouthOpening ? 'text-green-600' : 'text-red-600'}`}>
                    {analysisData.mouthOpeningDistance} mm
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">치우침 유무:</span>
                  <span className="font-medium">{analysisData.hasDeviation ? 'O' : 'X'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">치우침 거리:</span>
                  <span className="font-medium">{analysisData.deviationDistance} mm</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">최대 치우침 발생 시기:</span>
                  <span className="font-medium">{analysisData.maxDeviationTime}</span>
                </div>
              </div>
              <Alert variant="destructive" className={isNormalMouthOpening ? 'hidden' : ''}>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>주의</AlertTitle>
                <AlertDescription>
                  입 벌림 거리가 정상 범위보다 낮습니다. 정상 수치는 35mm 이상입니다.
                </AlertDescription>
              </Alert>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">정상 수치</h3>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">입 벌림 거리:</span>
                  <span className="font-medium">{analysisData.normalValues.mouthOpeningDistance}mm 이상</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">치우침 거리:</span>
                  <span className="font-medium">
                    {analysisData.normalValues.deviationDistanceMin} ~ {analysisData.normalValues.deviationDistanceMax} mm 미만
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="charts">그래프 분석</TabsTrigger>
          <TabsTrigger value="comparison">정상치 비교</TabsTrigger>
          <TabsTrigger value="progress">진행 상황</TabsTrigger>
          <TabsTrigger value="coordinates">좌표 시각화</TabsTrigger>
          <TabsTrigger value="chinComparison">턱 좌표 비교</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>입 벌림 거리 분석</CardTitle>
              <CardDescription>현재 측정값과 정상 범위 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <MouthOpeningChart
                  current={analysisData.mouthOpeningDistance}
                  normal={analysisData.normalValues.mouthOpeningDistance}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>치우침 분석</CardTitle>
              <CardDescription>입 벌림 과정에서의 치우침 정도</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <DeviationChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>전체 진행 상황</CardTitle>
              <CardDescription>현재 상태 평가</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ProgressChart
                  mouthOpeningPercentage={
                    (analysisData.mouthOpeningDistance / analysisData.normalValues.mouthOpeningDistance) *
                    100
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coordinates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>턱-코 좌표 연결 시각화</CardTitle>
              <CardDescription>
                각 측정값의 턱(chinTip)과 코(noseTip) 좌표를 점선으로 연결하여 수직 편차를 확인
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ReactECharts option={coordinatesOption} style={{ height: '100%' }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chinComparison" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>입 열림/닫힘 시 턱 좌표 비교</CardTitle>
              <CardDescription>
                각 동작에서 입 열림과 입 닫힘 시의 턱 좌표 <b>평균</b>을 비교(점선 연결)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ReactECharts option={chinComparisonAvgOption} style={{ height: '100%' }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 라운드별 분석 그래프 (기존) */}
      {graphOptions.map((graphOption, index) => (
        <section key={index} className="mt-4">
          <div style={{ height: 400 }}>
            <ReactECharts option={graphOption} style={{ height: '100%' }} />
          </div>
        </section>
      ))}
    </div>
  )
}

export default AnalysisResults
