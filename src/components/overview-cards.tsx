"use client";

import { FileText, Lightbulb, Building2, Key, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { overviewStats as staticStats, type OverviewStat } from "@/lib/data";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Lightbulb,
  Building2,
  Key,
};

export function OverviewCards({ stats }: { stats?: OverviewStat[] }) {
  const items = stats ?? staticStats;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat) => {
        const Icon = iconMap[stat.icon] || FileText;
        const isUp = stat.change >= 0;

        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    isUp
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(stat.change)}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-0.5 text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-xs text-gray-400">{stat.changeLabel}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
