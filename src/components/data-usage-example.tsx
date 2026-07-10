"use client";

import { useIDFData, usePatentData } from "@/lib/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

/**
 * Example component showing how to use the new file access infrastructure
 * 
 * Usage:
 * - Import and use useIDFData() and usePatentData() hooks
 * - Data is automatically fetched and available in the component
 * - You can refetch at any time
 * 
 * See FILE_ACCESS_README.md for full documentation
 */

export function DataUsageExample() {
  const { data: idfData, loading: idfLoading, error: idfError } = useIDFData();
  const { data: patents, loading: patentLoading, error: patentError } = usePatentData();

  // Group IDFs by category
  const idfsByCategory = idfData?.reduce(
    (acc, record) => {
      const cat = record.technology_category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Group Patents by subject matter
  const patentsBySubject = patents?.reduce(
    (acc, record) => {
      const subject = record["Subject matter"] || "Other";
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* IDF Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>IDF Data Example</CardTitle>
          <CardDescription>Shows how to use the useIDFData() hook</CardDescription>
        </CardHeader>
        <CardContent>
          {idfLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : idfError ? (
            <p className="text-red-600">Error: {idfError}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-semibold">Total IDFs: {idfData?.length}</p>
              
              <div>
                <h4 className="font-semibold mb-2">By Technology Category:</h4>
                <div className="grid gap-2">
                  {Object.entries(idfsByCategory || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <details className="cursor-pointer">
                <summary className="text-sm text-gray-600 hover:text-gray-900">
                  View sample records ({idfData?.slice(0, 3).length})
                </summary>
                <div className="mt-2 bg-gray-50 p-2 rounded text-xs space-y-1 max-h-40 overflow-auto">
                  {idfData?.slice(0, 3).map((record, idx) => (
                    <div key={idx} className="border-b pb-1">
                      <div>ID: {record.idf_number}</div>
                      <div>Category: {record.technology_category}</div>
                      <div>By: {record.created_by}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patents Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>Patent Data Example</CardTitle>
          <CardDescription>Shows how to use the usePatentData() hook</CardDescription>
        </CardHeader>
        <CardContent>
          {patentLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : patentError ? (
            <p className="text-red-600">Error: {patentError}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-lg font-semibold">Total Patents: {patents?.length}</p>

              <div>
                <h4 className="font-semibold mb-2">By Subject Matter:</h4>
                <div className="grid gap-2">
                  {Object.entries(patentsBySubject || {})
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([subject, count]) => (
                      <div key={subject} className="flex justify-between text-sm">
                        <span>{subject}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <details className="cursor-pointer">
                <summary className="text-sm text-gray-600 hover:text-gray-900">
                  View sample records ({patents?.slice(0, 3).length})
                </summary>
                <div className="mt-2 bg-gray-50 p-2 rounded text-xs space-y-1 max-h-40 overflow-auto">
                  {patents?.slice(0, 3).map((record, idx) => (
                    <div key={idx} className="border-b pb-1">
                      <div>Docket: {record["Docket No."]}</div>
                      <div>Subject: {record["Subject matter"]}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reference Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📚 Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>In Components:</strong> Use <code className="bg-white px-1 rounded">useIDFData()</code> and{" "}
            <code className="bg-white px-1 rounded">usePatentData()</code> hooks
          </p>
          <p>
            <strong>In API Routes:</strong> Use <code className="bg-white px-1 rounded">parseCSV()</code> from{" "}
            <code className="bg-white px-1 rounded">@/lib/files</code>
          </p>
          <p>
            <strong>File Constants:</strong> Import <code className="bg-white px-1 rounded">FILE_PATHS</code> from{" "}
            <code className="bg-white px-1 rounded">@/lib/constants</code>
          </p>
          <p>
            <strong>Full Docs:</strong> See <code className="bg-white px-1 rounded">FILE_ACCESS_README.md</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
