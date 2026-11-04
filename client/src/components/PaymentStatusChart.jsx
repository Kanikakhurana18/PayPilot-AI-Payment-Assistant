
import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  Completed: "#10B981",
  Created: "#F59E0B",
  Failed: "#EF4444",
};

export default function PaymentStatusChart({ payments = [] }) {
  const data = useMemo(() => {
    const counts = {
      Completed: 0,
      Created: 0,
      Failed: 0,
    };

    payments.forEach((payment) => {
      if (Object.prototype.hasOwnProperty.call(counts, payment.status)) {
        counts[payment.status] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0);
  }, [payments]);

  const total = payments.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#11182B]">
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Payment Status
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Breakdown of all transactions
        </p>
      </div>

      {total === 0 ? (
        <div className="flex h-[245px] items-center justify-center text-sm text-slate-500">
          No payment data available yet.
        </div>
      ) : (
        <div className="relative mt-2 h-[245px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={58}
                outerRadius={85}
                paddingAngle={4}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [`${value} payments`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute left-0 right-0 top-[34%] text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {total}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Transactions
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
