type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 border-t-[3px] border-t-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400 font-medium">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900 mono-data">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}
