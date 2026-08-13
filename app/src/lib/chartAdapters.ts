import type { ChartSpec } from "./types";

const LIGHT = {
  bg: "transparent",
  text: "#1e293b",
  subtext: "#64748b",
  grid: "#e2e8f0",
  palette: ["#4f73f5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"],
};

const DARK = {
  bg: "transparent",
  text: "#f1f5f9",
  subtext: "#94a3b8",
  grid: "#334155",
  palette: ["#6b8ff8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#22d3ee", "#fb923c"],
};

function seed(s: string): () => number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return (h >>> 0) / 0xffffffff;
  };
}

function demoSeries(count: number, rand: () => number, low = 100, high = 1000) {
  return Array.from({ length: count }, () => Math.round(low + rand() * (high - low)));
}

function demoCategories(rand: () => number, count = 6) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.slice(0, count);
}

export function buildEChartsOption(spec: ChartSpec, isDark = false): object {
  const t = isDark ? DARK : LIGHT;
  const rand = seed(spec.chart_id + spec.title);

  const base = {
    backgroundColor: t.bg,
    color: t.palette,
    textStyle: { color: t.text, fontFamily: "Inter, system-ui, sans-serif" },
    grid: { top: 40, right: 20, bottom: 50, left: 60, containLabel: true },
    tooltip: { trigger: "axis" as const },
    legend: { textStyle: { color: t.subtext } },
  };

  const cats = demoCategories(rand);
  const vals = demoSeries(cats.length, rand);

  switch (spec.chart_type) {
    case "bar":
      return {
        ...base,
        xAxis: { type: "category", data: cats, axisLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{ type: "bar", data: vals, barMaxWidth: 40, itemStyle: { borderRadius: [4, 4, 0, 0] } }],
      };

    case "line":
      return {
        ...base,
        xAxis: { type: "category", data: cats, axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{ type: "line", data: vals, smooth: true, symbol: "circle", symbolSize: 6 }],
      };

    case "area":
      return {
        ...base,
        xAxis: { type: "category", data: cats, axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{
          type: "line", data: vals, smooth: true, areaStyle: { opacity: 0.3 },
          lineStyle: { width: 2 },
        }],
      };

    case "pie":
    case "donut": {
      const pieData = cats.slice(0, 5).map((name, i) => ({ name, value: vals[i] }));
      return {
        ...base,
        tooltip: { trigger: "item" as const },
        series: [{
          type: "pie",
          radius: spec.chart_type === "donut" ? ["40%", "70%"] : "65%",
          data: pieData,
          label: { color: t.text },
          emphasis: { itemStyle: { shadowBlur: 10 } },
        }],
      };
    }

    case "scatter": {
      const scatterData = Array.from({ length: 20 }, () => [
        Math.round(rand() * 1000),
        Math.round(rand() * 1000),
      ]);
      return {
        ...base,
        xAxis: { type: "value", axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{ type: "scatter", data: scatterData, symbolSize: 8 }],
      };
    }

    case "heatmap": {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);
      const heatData = days.flatMap((_, di) =>
        hours.map((_, hi) => [hi, di, Math.round(rand() * 100)])
      );
      return {
        ...base,
        grid: { top: 40, right: 60, bottom: 60, left: 60 },
        xAxis: { type: "category", data: hours, axisLabel: { color: t.subtext } },
        yAxis: { type: "category", data: days, axisLabel: { color: t.subtext } },
        visualMap: { min: 0, max: 100, calculable: true, orient: "horizontal", left: "center", bottom: 0, textStyle: { color: t.subtext } },
        series: [{ type: "heatmap", data: heatData, emphasis: { itemStyle: { shadowBlur: 10 } } }],
      };
    }

    case "treemap": {
      const tmData = cats.map((name, i) => ({ name, value: vals[i] }));
      return {
        ...base,
        series: [{ type: "treemap", data: tmData, label: { color: "#fff" } }],
      };
    }

    case "funnel": {
      const funnelData = ["Awareness", "Interest", "Consideration", "Intent", "Purchase"]
        .map((name, i) => ({ name, value: 1000 - i * Math.round(rand() * 150) }))
        .sort((a, b) => b.value - a.value);
      return {
        ...base,
        tooltip: { trigger: "item" as const },
        series: [{
          type: "funnel", data: funnelData,
          label: { color: t.text },
          itemStyle: { borderWidth: 0 },
        }],
      };
    }

    case "gauge": {
      const gaugeVal = Math.round(30 + rand() * 60);
      return {
        ...base,
        series: [{
          type: "gauge",
          data: [{ value: gaugeVal, name: spec.title }],
          detail: { formatter: "{value}%", color: t.text },
          title: { color: t.subtext },
          axisLine: { lineStyle: { width: 20, color: [[0.3, "#ef4444"], [0.7, "#f59e0b"], [1, "#10b981"]] } },
          axisTick: { lineStyle: { color: t.subtext } },
          splitLine: { lineStyle: { color: t.subtext } },
          axisLabel: { color: t.subtext },
        }],
      };
    }

    case "radar": {
      const indicators = ["Sales", "Marketing", "Ops", "Support", "R&D", "Finance"].map((name) => ({
        name,
        max: 1000,
      }));
      const radarVals = indicators.map(() => Math.round(200 + rand() * 700));
      return {
        ...base,
        radar: {
          indicator: indicators,
          axisName: { color: t.subtext },
          splitLine: { lineStyle: { color: t.grid } },
          splitArea: { areaStyle: { color: ["transparent"] } },
        },
        series: [{ type: "radar", data: [{ value: radarVals, name: "Score" }] }],
      };
    }

    case "waterfall": {
      const wfBase = Math.round(rand() * 500 + 500);
      const wfDeltas = demoSeries(5, rand, -200, 300);
      const wfData: number[] = [wfBase];
      wfDeltas.forEach((d) => wfData.push(wfData[wfData.length - 1] + d));
      return {
        ...base,
        xAxis: { type: "category", data: ["Base", ...cats.slice(0, 5), "Total"], axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{
          type: "bar",
          data: wfData,
          itemStyle: { borderRadius: [4, 4, 0, 0], color: (p: { dataIndex: number }) => p.dataIndex === 0 || p.dataIndex === wfData.length - 1 ? t.palette[0] : wfData[p.dataIndex] >= (wfData[p.dataIndex - 1] ?? 0) ? t.palette[1] : t.palette[3] },
        }],
      };
    }

    case "histogram": {
      const histData = Array.from({ length: 10 }, (_, i) => [i * 100, Math.round(rand() * 200 + 20)]);
      return {
        ...base,
        xAxis: { type: "value", axisLabel: { color: t.subtext } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: t.grid } }, axisLabel: { color: t.subtext } },
        series: [{ type: "bar", data: histData, barWidth: "99%", itemStyle: { borderRadius: [2, 2, 0, 0] } }],
      };
    }

    default:
      return {
        ...base,
        xAxis: { type: "category", data: cats },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: vals }],
      };
  }
}
