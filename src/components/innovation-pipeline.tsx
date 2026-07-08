"use client";

import { FileText, Search, Presentation, ArrowRight } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Invention Disclosure",
    icon: FileText,
    description: "Inventor fills out invention disclosure form detailing technology",
  },
  {
    number: 2,
    title: "Innovation Assessment",
    icon: Search,
    description: "Team evaluates strategic fit, market potential, and IP landscape",
    details: ["Strategic fit", "Market potential", "IP & patent landscape"],
  },
  {
    number: 3,
    title: "Executive Presentation",
    icon: Presentation,
    description: "Team presents findings to inventors and executive team",
  },
];

export function InnovationPipeline() {
  return (
    <div className="rounded-xl bg-blue-600 p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-semibold text-white">Innovation Pipeline</h3>
      <p className="mb-8 text-sm text-blue-100">
        What the innovation team is working on right now
      </p>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
        {steps.map((step, i) => (
          <div key={step.number} className="flex flex-1 flex-col items-center text-center md:px-4">
            {/* Circle + connector row */}
            <div className="flex w-full items-center">
              <div className="flex flex-1 justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 ring-4 ring-blue-600">
                  <step.icon className="h-5 w-5" />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block">
                  <ArrowRight className="h-5 w-5 text-blue-300" />
                </div>
              )}
            </div>

            <span className="mt-2 text-xs font-medium text-blue-200">Step {step.number}</span>
            <h4 className="mt-1 text-sm font-semibold text-white">{step.title}</h4>
            <p className="mt-1 text-xs text-blue-100">{step.description}</p>

            {step.details && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {step.details.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-xs text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-200" />
                    {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
