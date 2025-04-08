"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function DeviationChart() {
  // Sample data showing deviation during mouth opening process
  const data = [
    { percent: 0, deviation: 0 },
    { percent: 20, deviation: 0 },
    { percent: 40, deviation: 0 },
    { percent: 60, deviation: 0 },
    { percent: 80, deviation: 0 },
    { percent: 100, deviation: 0 },
  ]

  return (
    <ChartContainer
      config={{
        deviation: {
          label: "치우침 거리 (mm)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full w-full">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="percent"
          label={{ value: "입 벌림 진행률 (%)", position: "insideBottom", offset: -5 }} />
        <YAxis
          label={{ value: "치우침 거리 (mm)", angle: -90, position: "insideLeft" }}
          domain={[0, 10]} />
        <Tooltip content={<ChartTooltipContent />} />
        <ReferenceLine
          y={7}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{ value: "정상 범위 시작: 7mm", position: "right" }} />
        <ReferenceLine
          y={10}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{ value: "정상 범위 끝: 10mm", position: "right" }} />
        <Line
          type="monotone"
          dataKey="deviation"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ChartContainer>
  );
}

