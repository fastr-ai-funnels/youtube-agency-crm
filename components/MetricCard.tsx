type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
};

export function MetricCard({ label, value, sublabel }: MetricCardProps) {
  return (
    <div className="card card-accent p-5">
      <p className="heading-xs">{label}</p>
      <p className="mt-3 text-[2rem] font-extrabold text-slate-900 mono-data leading-none" style={{ letterSpacing: "-0.04em" }}>{value}</p>
      {sublabel && <p className="mt-2 text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}
