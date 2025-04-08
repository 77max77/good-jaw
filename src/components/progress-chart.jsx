"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

export function ProgressChart({
  mouthOpeningPercentage
}) {
  // Cap the percentage at 100
  const cappedPercentage = Math.min(mouthOpeningPercentage, 100)
  const remaining = 100 - cappedPercentage

  const data = [
    { name: "진행률", value: cappedPercentage },
    { name: "남은 목표", value: remaining },
  ]

  const COLORS = ["#6366f1", "#e2e8f0"]

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">전체 진행률</h3>
        <p className="text-3xl font-bold text-indigo-600">{Math.round(cappedPercentage)}%</p>
        <p className="text-sm text-gray-500">정상 범위 대비</p>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            startAngle={90}
            endAngle={-270}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

