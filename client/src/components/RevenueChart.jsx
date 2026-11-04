
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function RevenueChart({ payments = [] }) {
  const [period, setPeriod] = useState("12M");

  const data = useMemo(() => {
    const months = period === "3M" ? 3 : period === "6M" ? 6 : 12;
    const now = new Date();

    const result = Array.from({ length: months }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - months + 1 + index,
        1
      );

      return {
        month: date.toLocaleString("en-US", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        revenue: 0,
      };
    });

    payments
      .filter((payment) => payment.status === "Completed")
      .forEach((payment) => {
        const date = new Date(payment.createdAt);

        if (Number.isNaN(date.getTime())) return;

        const month = result.find(
          (item) =>
            item.year === date.getFullYear() &&
            item.monthIndex === date.getMonth()
        );

        if (month) {
          month.revenue += Number(payment.amount || 0);
        }
      });

    return result;
  }, [payments, period]);

  const totalRevenue = data.reduce(
    (total, item) => total + item.revenue,
    0
  );

  return (
    <div className="bg-white dark:bg-[#11182B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Revenue Overview
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Monthly revenue from completed payments
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {formatCurrency(totalRevenue)}
          </h2>

          <p className="text-[11px] text-slate-400 mt-1">
            Revenue in selected period
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1A2238] rounded-xl p-1">
          {["3M", "6M", "12M"].map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                period === item
                  ? "bg-[#635bff] text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-indigo-500"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72 w-full">
        {payments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            No payment data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="paypilotRevenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#635bff" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#94a3b8"
                opacity={0.18}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(value) => `$${value}`}
                width={65}
              />

              <Tooltip
                formatter={(value) => [
                  formatCurrency(value),
                  "Revenue",
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.year
                    ? `${label} ${payload[0].payload.year}`
                    : label
                }
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#635bff"
                strokeWidth={3}
                fill="url(#paypilotRevenueGradient)"
                activeDot={{
                  r: 6,
                  fill: "#635bff",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
