"use client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

export function MouthOpeningChart({
  current,
  normal
}) {
  const data = [
    { name: "현재 측정값", value: current, fill: current >= normal ? "#10b981" : "#ef4444" },
    { name: "정상 범위", value: normal, fill: "#6366f1" },
  ]

  return (
    <ChartContainer
      config={{
        value: {
          label: "입 벌림 거리 (mm)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, Math.max(current, normal) * 1.2]} />
        <YAxis dataKey="name" type="category" />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
        <ReferenceLine
          x={normal}
          stroke="#6366f1"
          strokeDasharray="3 3"
          label={{ value: `정상 기준: ${normal}mm`, position: "top" }} />
      </BarChart>
    </ChartContainer>
  );
}

