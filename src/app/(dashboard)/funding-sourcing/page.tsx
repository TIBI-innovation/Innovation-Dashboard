"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  Landmark,
  Mail,
  Search,
  Target,
  Users,
} from "lucide-react";

interface FundingOrganization {
  id: string;
  organization_name: string;
  funding_type: string;
  website: string;
  headquarters: string;
  geographic_focus: string;
  mission_statement: string;
  supports_nonprofits: string;
  supports_startups: string;
  preferred_organization_type: string;
  funding_stage: string;
  typical_award_investment_size: string;
  funding_frequency: string;
  annual_budget_fund_size: string;
  equity_or_non_dilutive: string;
  why_they_are_a_good_fit: string;
  relevant_portfolio_companies_or_grantees: string;
  previous_nonprofit_partnerships: string;
  previous_university_partnerships: string;
  recent_awards_or_investments: string;
  key_contact: string;
  contact_title: string;
  email: string;
  phone: string;
  linkedin_profile: string;
  existing_relationship: string;
  warm_introduction_source: string;
  application_type: string;
  application_deadline: string;
  required_materials: string;
  date_contacted: string;
  last_communication: string;
  next_follow_up: string;
  status: string;
  probability_of_success: string;
  priority: string;
  notes: string;
}

function getBadgeClass(value: string): string {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue || normalizedValue === "none") {
    return "bg-gray-100 text-gray-600";
  }
  if (normalizedValue.includes("warm")) {
    return "bg-amber-100 text-amber-700";
  }
  if (normalizedValue.includes("active") || normalizedValue.includes("current")) {
    return "bg-green-100 text-green-700";
  }
  return "bg-blue-100 text-blue-700";
}

function isSupportive(value: string): boolean {
  return value.trim().toLowerCase() === "yes";
}

function hasRelationship(value: string): boolean {
  const normalizedValue = value.trim().toLowerCase();
  return Boolean(normalizedValue) && normalizedValue !== "none" && normalizedValue !== "n/a";
}

function getOrganizationKey(organization: FundingOrganization): string {
  return organization.id || organization.organization_name;
}

export default function FundingSourcingPage() {
  const [organizations, setOrganizations] = useState<FundingOrganization[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fundingTypeFilter, setFundingTypeFilter] = useState("all");
  const [organizationTypeFilter, setOrganizationTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/funding-organizations", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Failed to load funding organizations.");
        }
        return response.json();
      })
      .then((data) => {
        const nextOrganizations = Array.isArray(data) ? (data as FundingOrganization[]) : [];
        setOrganizations(nextOrganizations);
        setSelectedId(nextOrganizations[0] ? getOrganizationKey(nextOrganizations[0]) : "");
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load funding organizations.");
        setLoading(false);
      });
  }, []);

  const fundingTypes = useMemo(
    () =>
      Array.from(
        new Set(
          organizations
            .map((organization) => organization.funding_type)
            .filter((value) => value.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [organizations]
  );

  const organizationTypes = useMemo(
    () =>
      Array.from(
        new Set(
          organizations
            .map((organization) => organization.preferred_organization_type)
            .filter((value) => value.trim().length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [organizations]
  );

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesSearch =
        !normalizedQuery ||
        [
          organization.organization_name,
          organization.funding_type,
          organization.headquarters,
          organization.geographic_focus,
          organization.why_they_are_a_good_fit,
          organization.key_contact,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesFundingType =
        fundingTypeFilter === "all" || organization.funding_type === fundingTypeFilter;
      const matchesOrganizationType =
        organizationTypeFilter === "all" ||
        organization.preferred_organization_type === organizationTypeFilter;

      return matchesSearch && matchesFundingType && matchesOrganizationType;
    });
  }, [fundingTypeFilter, organizationTypeFilter, organizations, searchQuery]);

  const selectedOrganization = useMemo(() => {
    if (!filteredOrganizations.length) return null;
    return (
      filteredOrganizations.find((organization) => getOrganizationKey(organization) === selectedId) ||
      filteredOrganizations[0]
    );
  }, [filteredOrganizations, selectedId]);

  const summaryCards = useMemo(
    () => [
      {
        title: "Funding Sources",
        description: "Organizations listed in the CRM workbook",
        value: organizations.length,
        icon: Building2,
      },
      {
        title: "Funding Types",
        description: "Distinct capital and grant channels",
        value: fundingTypes.length,
        icon: Briefcase,
      },
      {
        title: "Startup-Friendly",
        description: "Organizations that support startups",
        value: organizations.filter((organization) => isSupportive(organization.supports_startups)).length,
        icon: Target,
      },
      {
        title: "Existing Relationships",
        description: "Contacts with a recorded relationship",
        value: organizations.filter((organization) =>
          hasRelationship(organization.existing_relationship)
        ).length,
        icon: Users,
      },
    ],
    [fundingTypes.length, organizations]
  );

  return (
    <>
      <Header />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Funding</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review the first worksheet of the Terasaki Funding CRM and identify aligned funding targets.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <card.icon className="h-5 w-5 text-primary-600" />
                  <CardTitle>{card.title}</CardTitle>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">{loading ? "—" : card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary-600" />
              <CardTitle>Browse Funding CRM</CardTitle>
            </div>
            <CardDescription>
              Filter organizations by name, funding type, and supported organization profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(220px,1fr)]">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search organization, fit, geography, or contact..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <select
                value={fundingTypeFilter}
                onChange={(event) => setFundingTypeFilter(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All funding types</option>
                {fundingTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                value={organizationTypeFilter}
                onChange={(event) => setOrganizationTypeFilter(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All organization profiles</option>
                {organizationTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400">
              Showing {filteredOrganizations.length} of {organizations.length} organizations from the workbook.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                <CardTitle>Funding Opportunities</CardTitle>
              </div>
              <CardDescription>Workbook-backed funding targets from the CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading funding organizations...</p>
              ) : error ? (
                <p className="py-4 text-center text-sm text-red-600">{error}</p>
              ) : filteredOrganizations.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No funding organizations match the current filters.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                        <th className="pb-2 pr-4 font-medium">Organization</th>
                        <th className="pb-2 pr-4 font-medium">Funding Type</th>
                        <th className="pb-2 pr-4 font-medium">Stage</th>
                        <th className="pb-2 pr-4 font-medium">Best For</th>
                        <th className="pb-2 font-medium">Relationship</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrganizations.map((organization) => {
                        const organizationKey = getOrganizationKey(organization);
                        const selectedKey = selectedOrganization
                          ? getOrganizationKey(selectedOrganization)
                          : "";
                        const isSelected = organizationKey === selectedKey;
                        return (
                          <tr
                            key={organizationKey}
                            className={`border-b border-gray-100 last:border-0 ${
                              isSelected ? "bg-primary-50/60" : ""
                            }`}
                          >
                            <td className="py-2.5 pr-4 align-top">
                              <button
                                type="button"
                                onClick={() => setSelectedId(organizationKey)}
                                className="text-left"
                              >
                                <p className="font-medium text-gray-900">{organization.organization_name}</p>
                                <p className="text-xs text-gray-500">
                                  {organization.headquarters || "—"} • {organization.geographic_focus || "—"}
                                </p>
                              </button>
                            </td>
                            <td className="py-2.5 pr-4 align-top text-gray-700">
                              {organization.funding_type || "—"}
                            </td>
                            <td className="py-2.5 pr-4 align-top text-gray-700">
                              {organization.funding_stage || "—"}
                            </td>
                            <td className="py-2.5 pr-4 align-top text-gray-700">
                              {organization.preferred_organization_type || "—"}
                            </td>
                            <td className="py-2.5 align-top">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(
                                  organization.existing_relationship
                                )}`}
                              >
                                {organization.existing_relationship || "No relationship"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary-600" />
                <CardTitle>Organization Details</CardTitle>
              </div>
              <CardDescription>Selected CRM entry with contact and alignment details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="py-4 text-center text-sm text-gray-400">Loading details...</p>
              ) : error ? (
                <p className="py-4 text-center text-sm text-red-600">{error}</p>
              ) : !selectedOrganization ? (
                <p className="py-4 text-center text-sm text-gray-400">Select an organization to view its details.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedOrganization.organization_name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedOrganization.funding_type || "—"} •{" "}
                          {selectedOrganization.funding_stage || "Stage not listed"}
                        </p>
                      </div>
                      {selectedOrganization.website ? (
                        <a
                          href={selectedOrganization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                        >
                          Visit site
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-700">
                      {selectedOrganization.why_they_are_a_good_fit || selectedOrganization.mission_statement || "No summary available."}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Headquarters</p>
                      <p className="mt-1 text-sm text-gray-700">{selectedOrganization.headquarters || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Geographic Focus</p>
                      <p className="mt-1 text-sm text-gray-700">{selectedOrganization.geographic_focus || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Typical Award / Investment</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.typical_award_investment_size || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Funding Frequency</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.funding_frequency || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Funding Structure</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.equity_or_non_dilutive || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Annual Budget / Fund Size</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.annual_budget_fund_size || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Supports</p>
                      <p className="mt-1 text-sm text-gray-700">
                        Nonprofits: {selectedOrganization.supports_nonprofits || "—"} | Startups:{" "}
                        {selectedOrganization.supports_startups || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Best Fit</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.preferred_organization_type || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary-600" />
                      <p className="text-sm font-semibold text-gray-900">Contact & Relationship</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Key Contact</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.key_contact || "—"}
                          {selectedOrganization.contact_title
                            ? ` (${selectedOrganization.contact_title})`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Existing Relationship</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.existing_relationship || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Warm Introduction</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.warm_introduction_source || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Contact Details</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.email || "No email"}{" "}
                          {selectedOrganization.phone ? `| ${selectedOrganization.phone}` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">LinkedIn / Profile</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.linkedin_profile ? (
                            <a
                              href={selectedOrganization.linkedin_profile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              Open profile
                            </a>
                          ) : (
                            "—"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Relevant Portfolio / Grantees</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.relevant_portfolio_companies_or_grantees || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Nonprofit Partnerships</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.previous_nonprofit_partnerships || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">University Partnerships</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.previous_university_partnerships || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Recent Awards / Investments</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.recent_awards_or_investments || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-400">Notes</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {selectedOrganization.notes || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-lg border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-900">Applications & Outreach</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Application Type</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.application_type || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Application Deadline</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.application_deadline || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Required Materials</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.required_materials || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Next Follow-up</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.next_follow_up || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Date Contacted</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.date_contacted || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Last Communication</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.last_communication || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Status</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.status || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-400">Priority / Probability</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {selectedOrganization.priority || "—"}{" "}
                          {selectedOrganization.probability_of_success
                            ? `| ${selectedOrganization.probability_of_success}/5`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
