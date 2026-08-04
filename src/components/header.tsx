"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, AlertCircle } from "lucide-react";

interface TechnologyRow {
  idf_number: string;
  technology_category: string;
  deadline: string;
}

interface PatentRow {
  patent_number: string;
  technology_category: string;
  status: string;
  notes: string;
}

interface UrgentItem {
  key: string;
  type: "IDF" | "Patent";
  id: string;
  category: string;
  detail: string;
}

function isUrgent(value: string): boolean {
  return (value || "").trim().toUpperCase() === "URGENT";
}

export function Header() {
  const [technologies, setTechnologies] = useState<TechnologyRow[]>([]);
  const [patents, setPatents] = useState<PatentRow[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/technologies").then((r) => r.json()),
      fetch("/api/patents").then((r) => r.json()),
    ])
      .then(([techs, pats]) => {
        const techPayload = techs as TechnologyRow[] | { technologies?: TechnologyRow[] };
        const patPayload = pats as PatentRow[] | { patents?: PatentRow[] };
        setTechnologies(Array.isArray(techPayload) ? techPayload : techPayload.technologies ?? []);
        setPatents(Array.isArray(patPayload) ? patPayload : patPayload.patents ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const urgentItems = useMemo<UrgentItem[]>(() => {
    const idfItems = technologies
      .filter((t) => isUrgent(t.deadline))
      .map((t) => ({
        key: `idf-${t.idf_number}`,
        type: "IDF" as const,
        id: t.idf_number,
        category: t.technology_category,
        detail: "",
      }));
    const patentItems = patents
      .filter((p) => isUrgent(p.status))
      .map((p) => ({
        key: `patent-${p.patent_number}`,
        type: "Patent" as const,
        id: p.patent_number,
        category: p.technology_category,
        detail: p.notes || "",
      }));
    return [...idfItems, ...patentItems];
  }, [technologies, patents]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-8">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {urgentItems.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-semibold text-gray-900">Urgent Items</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {urgentItems.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">No urgent items.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {urgentItems.map((item) => (
                    <li key={item.key} className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-400">{item.type}</span>
                        <span className="text-sm font-medium text-gray-900">{item.id}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{item.category || "—"}</p>
                      {item.detail && <p className="mt-1 text-xs text-gray-600">{item.detail}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
