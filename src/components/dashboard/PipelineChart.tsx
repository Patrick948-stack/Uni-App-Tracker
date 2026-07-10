import { useMemo } from "react";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PIPELINE_STAGES } from "@/types";
import type { University } from "@/types";

// Single-hue ordinal ramp: pipeline stage is a funnel position, not an
// independent category, so every bar shares one hue and only its lightness
// (via opacity, which reads consistently on both light and dark surfaces)
// steps up as a school moves further through the pipeline.
function opacityForStep(index: number, total: number): number {
  const min = 0.35;
  const max = 1;
  if (total <= 1) return max;
  return min + ((max - min) * index) / (total - 1);
}

export function PipelineChart({ universities }: { universities: University[] }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of universities) counts.set(u.pipelineStage, (counts.get(u.pipelineStage) ?? 0) + 1);

    return PIPELINE_STAGES.map((stage, i) => ({
      stage,
      count: counts.get(stage) ?? 0,
      opacity: opacityForStep(i, PIPELINE_STAGES.length),
    })).filter((d) => d.count > 0);
  }, [universities]);

  if (data.length === 0) {
    return <p className="text-[var(--muted)]">Move a school through the pipeline to see this chart.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={130}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--tiny)", fontSize: 12.5 }}
        />
        <Tooltip
          cursor={{ fill: "color-mix(in srgb, var(--color-accent) 8%, transparent)" }}
          contentStyle={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: 12,
            fontSize: 13,
            color: "var(--text)",
            backdropFilter: "blur(12px)",
          }}
          formatter={(value) => [`${value} school${value === 1 ? "" : "s"}`, ""]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((d) => (
            <Cell key={d.stage} fill="var(--color-accent)" fillOpacity={d.opacity} />
          ))}
          <LabelList dataKey="count" position="right" style={{ fill: "var(--text)", fontSize: 12.5, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
