import { ChartSpec } from "./types";

type EChartsOption = Record<string, unknown>;

function syntheticData(spec: ChartSpec) {
  const seed = spec.chart_id.charCodeAt(0) + spec.title.length;
  const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const values = categories.map((_, i) => Math.floor(((seed * (i + 7) * 1337) % 80000) + 20000));
  const series2 = categories.map((_, i) => Math.floor(((seed * (i + 3) * 999) % 50000) + 10000));
  return { categories, values, series2 };
}

const lightTheme = {
  bg: "transparent", text: "#374151", axis: "#e5e7eb", gridLine: "#f3f4f6",
  tooltipBg: "#1f2937", primary: "#4f73f5", secondary: "#10b981",
  palette: ["#4f73f5","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"],
};
const darkTheme = {
  bg: "transparent", text: "#d1d5db", axis: "#374151", gridLine: "#1f2937",
  tooltipBg: "#374151", primary: "#6b8ff8", secondary: "#34d399",
  palette: ["#6b8ff8","#34d399","#fbbf24","#f87171","#a78bfa","#22d3ee","#fb923c"],
};

export function buildEChartsOption(spec: ChartSpec, isDark: boolean): EChartsOption {
  const t = isDark ? darkTheme : lightTheme;
  const d = syntheticData(spec);

  switch (spec.type) {
    case "line": case "area": return lineArea(spec, t, d);
    case "bar": return bar(spec, t, d);
    case "bar_horizontal": return barH(spec, t, d);
    case "stacked_bar": return stackedBar(spec, t, d);
    case "pie": case "donut": return pieDonut(spec, t, d);
    case "scatter": return scatter(t);
    case "heatmap": return heatmap(t);
    case "funnel": return funnel(t, d);
    case "gauge": return gauge(t);
    case "treemap": return treemap(t, d);
    default: return bar(spec, t, d);
  }
}

function lineArea(s: ChartSpec, t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "axis", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    grid: { left: "3%", right: "4%", bottom: "8%", top: "10%", containLabel: true },
    xAxis: { type: "category", data: d.categories, axisLine: { lineStyle: { color: t.axis } }, axisLabel: { color: t.text, fontSize: 11 } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text, fontSize: 11 } },
    series: [
      { name: s.fields.y || "Value", type: "line", smooth: true, data: d.values,
        areaStyle: s.type === "area" ? { opacity: 0.15 } : undefined,
        lineStyle: { width: 2.5, color: t.primary }, itemStyle: { color: t.primary }, symbol: "circle", symbolSize: 6 },
      ...(s.fields.y2 ? [{ name: s.fields.y2, type: "line", smooth: true, data: d.series2,
        lineStyle: { width: 2, color: t.secondary }, itemStyle: { color: t.secondary } }] : []),
    ],
  };
}

function bar(s: ChartSpec, t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "axis", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    grid: { left: "3%", right: "4%", bottom: "8%", top: "10%", containLabel: true },
    xAxis: { type: "category", data: d.categories, axisLabel: { color: t.text, fontSize: 11 }, axisLine: { lineStyle: { color: t.axis } } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text, fontSize: 11 } },
    series: [{ name: s.fields.y || "Value", type: "bar", data: d.values,
      itemStyle: { color: t.primary, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 48 }],
  };
}

function barH(_s: ChartSpec, t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "axis", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    grid: { left: "3%", right: "8%", bottom: "5%", top: "5%", containLabel: true },
    xAxis: { type: "value", splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text, fontSize: 11 } },
    yAxis: { type: "category", data: [...d.categories].slice(0, 8).reverse(), axisLabel: { color: t.text, fontSize: 11 } },
    series: [{ type: "bar", data: [...d.values].slice(0, 8).reverse(),
      itemStyle: { color: t.primary, borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: t.text, fontSize: 10 } }],
  };
}

function stackedBar(_s: ChartSpec, t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    legend: { textStyle: { color: t.text } },
    grid: { left: "3%", right: "4%", bottom: "8%", top: "15%", containLabel: true },
    xAxis: { type: "category", data: d.categories, axisLabel: { color: t.text } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text } },
    series: [
      { name: "Series A", type: "bar", stack: "total", data: d.values, itemStyle: { color: t.primary } },
      { name: "Series B", type: "bar", stack: "total", data: d.series2, itemStyle: { color: t.secondary } },
    ],
  };
}

function pieDonut(s: ChartSpec, t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  const topN = s.top_n || 5;
  const pieData = d.categories.slice(0, topN).map((name, i) => ({ name, value: d.values[i] }));
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "item", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    legend: { orient: "vertical", left: "left", textStyle: { color: t.text } },
    series: [{ type: "pie", radius: s.type === "donut" ? ["45%", "70%"] : "65%",
      data: pieData, label: { color: t.text, fontSize: 11 },
      itemStyle: { borderRadius: 4, borderColor: t.bg, borderWidth: 2 }, color: t.palette }],
  };
}

function scatter(t: typeof lightTheme): EChartsOption {
  const data = Array.from({ length: 40 }, () => [Math.random() * 100, Math.random() * 100, Math.random() * 50 + 10]);
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "item", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    xAxis: { splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text } },
    yAxis: { splitLine: { lineStyle: { color: t.gridLine } }, axisLabel: { color: t.text } },
    series: [{ type: "scatter", data, itemStyle: { color: t.primary, opacity: 0.7 }, symbolSize: (d: number[]) => Math.sqrt(d[2]) * 3 }],
  };
}

function heatmap(t: typeof lightTheme): EChartsOption {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data: [number, number, number][] = [];
  days.forEach((_, d) => hours.forEach((_, h) => data.push([h, d, Math.floor(Math.random() * 10)])));
  return {
    backgroundColor: t.bg,
    tooltip: { position: "top", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    grid: { height: "50%", top: "10%" },
    xAxis: { type: "category", data: hours, axisLabel: { color: t.text, fontSize: 9 } },
    yAxis: { type: "category", data: days, axisLabel: { color: t.text } },
    visualMap: { min: 0, max: 10, calculable: true, orient: "horizontal", left: "center", bottom: "15%", textStyle: { color: t.text } },
    series: [{ type: "heatmap", data, label: { show: false } }],
  };
}

function funnel(t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  const stages = ["Awareness", "Interest", "Consideration", "Intent", "Purchase"];
  const funnelData = stages.map((name, i) => ({ name, value: Math.floor(d.values[0] * Math.pow(0.65, i)) }));
  return {
    backgroundColor: t.bg,
    tooltip: { trigger: "item", backgroundColor: t.tooltipBg, textStyle: { color: t.text } },
    series: [{ type: "funnel", left: "10%", width: "80%", data: funnelData,
      label: { color: t.text }, itemStyle: { borderColor: t.bg, borderWidth: 2 }, color: t.palette }],
  };
}

function gauge(t: typeof lightTheme): EChartsOption {
  const value = 65;
  return {
    backgroundColor: t.bg,
    series: [{
      type: "gauge", progress: { show: true, width: 12 },
      axisLine: { lineStyle: { width: 12, color: [[1, t.axis]] } },
      pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      title: { offsetCenter: [0, "70%"], color: t.text, fontSize: 13 },
      detail: { valueAnimation: true, fontSize: 28, fontWeight: "bold", color: t.primary, formatter: "{value}%", offsetCenter: [0, 0] },
      data: [{ value, name: "Achievement" }], color: [t.primary],
    }],
  };
}

function treemap(t: typeof lightTheme, d: ReturnType<typeof syntheticData>): EChartsOption {
  const treeData = d.categories.map((name, i) => ({
    name, value: d.values[i], itemStyle: { color: t.palette[i % t.palette.length] },
  }));
  return {
    backgroundColor: t.bg,
    tooltip: { formatter: (p: { name: string; value: number }) => `${p.name}: ${p.value.toLocaleString()}` },
    series: [{ type: "treemap", data: treeData, label: { show: true, formatter: "{b}", color: "#fff", fontSize: 12 }, breadcrumb: { show: false } }],
  };
}
