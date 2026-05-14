'use client'

interface DashboardCardProps {
  title: string
  count: number
}

export function DashboardCard({ title, count }: DashboardCardProps) {
  return (
    <div className="rounded-xl border border-[#d7c8b8] bg-white p-6 shadow-sm transition hover:border-[#d4a03d] hover:shadow-md">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#7b6b5d]">{title}</p>
      <p className="mt-3 text-4xl font-black text-[#6f2f38]">{count}</p>
    </div>
  )
}
