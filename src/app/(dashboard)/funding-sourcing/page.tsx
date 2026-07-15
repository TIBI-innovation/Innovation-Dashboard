"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, CalendarClock, CheckCircle2 } from "lucide-react";

const fundingPrograms = [
  {
    name: "SBIR / STTR Programs",
    stage: "Early-stage research",
    deadline: "Rolling by agency",
    notes: "Target translational milestones and include a commercialization plan.",
  },
  {
    name: "Disease-Focused Foundations",
    stage: "Proof-of-concept",
    deadline: "Quarterly cycles",
    notes: "Prioritize programs aligned to current therapeutic focus areas.",
  },
  {
    name: "Strategic Industry Partnerships",
    stage: "Late validation",
    deadline: "Partner dependent",
    notes: "Package IP strength and development roadmap for co-development discussions.",
  },
];

const actionChecklist = [
  "Confirm technology-readiness level for each disclosure.",
  "Map target funding source to technology category.",
  "Prepare one-page non-confidential summary.",
  "Align submission timeline with patent and licensing milestones.",
];

export default function FundingSourcingPage() {
  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Funding Sourcing</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track potential funding channels and next actions for innovation projects.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                <CardTitle>Funding Opportunities</CardTitle>
              </div>
              <CardDescription>Priority channels to support portfolio development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundingPrograms.map((program) => (
                  <div
                    key={program.name}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">{program.name}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Stage:</span> {program.stage}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      <span className="font-medium text-gray-700">Notes:</span> {program.notes}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {program.deadline}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
                <CardTitle>Action Checklist</CardTitle>
              </div>
              <CardDescription>Recommended prep before outreach and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {actionChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
