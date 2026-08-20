"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, MapPin, Megaphone, Wrench } from "lucide-react";

interface StatusCount {
  status: string;
  count: number;
}

interface DistrictCount {
  district: string;
  count: number;
}

interface MonthlyTrendPoint {
  month: string; // "yyyy-mm"
  created: number;
  fixed: number;
  avgFixTimeDays: number | null;
}

interface SpotHoleStats {
  byStatus: StatusCount[];
  totalCount: number;
  bigHolePending: number;
  vereadorPending: number;
  topDistricts: DistrictCount[];
  avgFixTimeDays: number | null;
  monthlyTrend: MonthlyTrendPoint[];
}

interface WorkZoneStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgCompletionPercent: number;
}

const MONTH_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const formatMonth = (month: string) => {
  const [year, m] = month.split("-");
  return `${MONTH_LABELS[Number(m) - 1]}/${year.slice(2)}`;
};

const statusCount = (byStatus: StatusCount[], status: string) =>
  byStatus.find((s) => s.status === status)?.count ?? 0;

const CHART_WIDTH = 700;
const CHART_HEIGHT = 200;
const CHART_PADDING_X = 10;

// Barras (criados/reparados, escala de contagem) + linha pontilhada (tempo médio de
// reparo, escala própria em dias) no mesmo gráfico, com tooltip detalhado ao passar o mouse.
const MonthlyTrendChart = ({ data }: { data: MonthlyTrendPoint[] }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxCount = Math.max(1, ...data.flatMap((m) => [m.created, m.fixed]));
  const maxFixTime = Math.max(1, ...data.map((m) => m.avgFixTimeDays ?? 0));

  const columnWidth = (CHART_WIDTH - CHART_PADDING_X * 2) / data.length;
  const barWidth = columnWidth * 0.28;
  const barGap = columnWidth * 0.08;

  const fixTimeY = (value: number) => CHART_HEIGHT - (value / maxFixTime) * CHART_HEIGHT;

  const linePoints = data.map((m, i) =>
    m.avgFixTimeDays !== null
      ? { x: CHART_PADDING_X + columnWidth * (i + 0.5), y: fixTimeY(m.avgFixTimeDays) }
      : null,
  );

  let linePath = "";
  let penDown = false;
  linePoints.forEach((p) => {
    if (!p) {
      penDown = false;
      return;
    }
    linePath += `${penDown ? "L" : "M"}${p.x},${p.y} `;
    penDown = true;
  });

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full" style={{ height: CHART_HEIGHT }}>
        {data.map((m, i) => {
          const x = CHART_PADDING_X + columnWidth * i;
          const createdH = (m.created / maxCount) * CHART_HEIGHT;
          const fixedH = (m.fixed / maxCount) * CHART_HEIGHT;
          return (
            <g key={m.month}>
              <rect
                x={x + columnWidth / 2 - barWidth - barGap / 2}
                y={CHART_HEIGHT - createdH}
                width={barWidth}
                height={createdH}
                className="fill-red-400"
              />
              <rect
                x={x + columnWidth / 2 + barGap / 2}
                y={CHART_HEIGHT - fixedH}
                width={barWidth}
                height={fixedH}
                className="fill-green-400"
              />
            </g>
          );
        })}
        {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 4" />}
        {linePoints.map(
          (p, i) => p && <circle key={i} cx={p.x} cy={p.y} r={3} className="fill-blue-600" />,
        )}
        {hoverIndex !== null && (
          <line
            x1={CHART_PADDING_X + columnWidth * (hoverIndex + 0.5)}
            x2={CHART_PADDING_X + columnWidth * (hoverIndex + 0.5)}
            y1={0}
            y2={CHART_HEIGHT}
            stroke="#d1d5db"
            strokeWidth={1}
          />
        )}
        {data.map((_, i) => (
          <rect
            key={`hover-${i}`}
            x={CHART_PADDING_X + columnWidth * i}
            y={0}
            width={columnWidth}
            height={CHART_HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[9px] text-gray-500">
        {data.map((m) => (
          <span key={m.month}>{formatMonth(m.month)}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> Criados
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" /> Reparados
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> Tempo médio de reparo
        </span>
      </div>
      {hovered && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-40 -translate-x-1/2 rounded-md border bg-white p-2 text-xs shadow-lg"
          style={{
            left: `${Math.min(90, Math.max(10, ((hoverIndex! + 0.5) / data.length) * 100))}%`,
          }}
        >
          <p className="mb-1 font-semibold">{formatMonth(hovered.month)}</p>
          <p className="text-red-500">Criados: {hovered.created}</p>
          <p className="text-green-600">Reparados: {hovered.fixed}</p>
          <p className="text-blue-600">
            Tempo médio: {hovered.avgFixTimeDays !== null ? `${hovered.avgFixTimeDays.toFixed(1)} dias` : "—"}
          </p>
        </div>
      )}
    </div>
  );
};

// Card compacto com ícone monocromático — bloco básico dos indicadores do dashboard.
const KpiCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5">
    <div className="shrink-0 text-gray-400">{icon}</div>
    <div className="min-w-0">
      <p className="truncate text-[11px] leading-tight text-gray-500">{label}</p>
      <p className="text-base font-semibold leading-tight">{value}</p>
    </div>
  </div>
);

const DashboardTab = () => {
  const [spotHoleStats, setSpotHoleStats] = useState<SpotHoleStats | null>(null);
  const [workZoneStats, setWorkZoneStats] = useState<WorkZoneStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [spotHoleRes, workZoneRes] = await Promise.all([
          fetch("/api/spothole/stats", { cache: "no-store" }),
          fetch("/api/workzone/stats", { cache: "no-store" }),
        ]);
        if (!spotHoleRes.ok || !workZoneRes.ok) {
          throw new Error("Erro ao carregar os indicadores.");
        }
        setSpotHoleStats(await spotHoleRes.json());
        setWorkZoneStats(await workZoneRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar os indicadores.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-gray-500">Carregando indicadores...</p>;
  }

  if (error || !spotHoleStats || !workZoneStats) {
    return <p className="py-12 text-center text-sm text-red-500">{error ?? "Erro ao carregar os indicadores."}</p>;
  }

  const maxDistrictCount = Math.max(1, ...spotHoleStats.topDistricts.map((d) => d.count));

  return (
    <div className="space-y-6">
      {spotHoleStats.vereadorPending > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <Megaphone size={20} className="shrink-0 text-amber-600" />
          <p className="text-sm">
            <span className="font-semibold">{spotHoleStats.vereadorPending}</span>{" "}
            {spotHoleStats.vereadorPending === 1
              ? "buraco de vereador está pendente de reparo."
              : "buracos de vereadores estão pendentes de reparo."}
          </p>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Buracos</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <KpiCard
            icon={<MapPin size={16} />}
            label="Total de buracos"
            value={String(spotHoleStats.totalCount)}
          />
          <KpiCard
            icon={<AlertTriangle size={16} />}
            label="Abertos"
            value={String(statusCount(spotHoleStats.byStatus, "Aberto"))}
          />
          <KpiCard
            icon={<Wrench size={16} />}
            label="Em manutenção"
            value={String(statusCount(spotHoleStats.byStatus, "Manutenção"))}
          />
          <KpiCard
            icon={<CheckCircle2 size={16} />}
            label="Reparados"
            value={String(statusCount(spotHoleStats.byStatus, "Reparado"))}
          />
          <KpiCard
            icon={<Clock size={16} />}
            label="Tempo médio de reparo"
            value={spotHoleStats.avgFixTimeDays !== null ? `${spotHoleStats.avgFixTimeDays.toFixed(1)} dias` : "—"}
          />
          <KpiCard
            icon={<AlertTriangle size={16} />}
            label="Buracos grandes pendentes"
            value={String(spotHoleStats.bigHolePending)}
          />
          <KpiCard
            icon={<Megaphone size={16} />}
            label="Buracos de vereadores pendentes"
            value={String(spotHoleStats.vereadorPending)}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Zonas de trabalho</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <KpiCard
            icon={<MapPin size={16} />}
            label="Total de zonas"
            value={String(workZoneStats.total)}
          />
          <KpiCard
            icon={<CheckCircle2 size={16} />}
            label="Concluídas"
            value={String(workZoneStats.completed)}
          />
          <KpiCard
            icon={<Clock size={16} />}
            label="Em andamento"
            value={String(workZoneStats.inProgress)}
          />
          <KpiCard
            icon={<AlertTriangle size={16} />}
            label="Atrasadas"
            value={String(workZoneStats.overdue)}
          />
        </div>
        <div className="mt-3 rounded-lg border bg-white p-4 shadow-sm">
          <p className="mb-1 text-xs text-gray-500">Progresso médio de conclusão</p>
          <div className="flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, workZoneStats.avgCompletionPercent).toFixed(0)}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{workZoneStats.avgCompletionPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Bairros com mais buracos abertos</h2>
          {spotHoleStats.topDistricts.length === 0 ? (
            <p className="text-sm text-gray-400">Sem dados suficientes.</p>
          ) : (
            <div className="space-y-2">
              {spotHoleStats.topDistricts.map((d) => (
                <div key={d.district} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-xs text-gray-600" title={d.district}>
                    {d.district}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded bg-gray-100">
                    <div
                      className="h-full rounded bg-red-400"
                      style={{ width: `${(d.count / maxDistrictCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Criados x reparados (últimos 12 meses)</h2>
          <MonthlyTrendChart data={spotHoleStats.monthlyTrend} />
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
