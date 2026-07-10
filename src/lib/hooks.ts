import { useState, useEffect } from "react";
import { IDFRecord, PatentRecord } from "@/lib/constants";

interface UseFetchOptions {
  autoFetch?: boolean;
}

interface UseDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch IDF data from CSV
 */
export function useIDFData(options: UseFetchOptions = {}): UseDataReturn<IDFRecord[]> {
  const { autoFetch = true } = options;
  const [data, setData] = useState<IDFRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/data/idf");
      if (!response.ok) throw new Error("Failed to fetch IDF data");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch]);

  return { data, loading, error, refetch };
}

/**
 * Hook to fetch Patent data from CSV
 */
export function usePatentData(options: UseFetchOptions = {}): UseDataReturn<PatentRecord[]> {
  const { autoFetch = true } = options;
  const [data, setData] = useState<PatentRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/data/patents");
      if (!response.ok) throw new Error("Failed to fetch patent data");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch]);

  return { data, loading, error, refetch };
}

/**
 * Generic hook to fetch any file data
 */
export function useFileData<T = unknown>(
  filePath: string,
  options: UseFetchOptions & { format?: "csv" | "json" | "text" } = {}
): UseDataReturn<T> {
  const { autoFetch = true, format } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        path: filePath,
        ...(format && { format }),
      });

      const response = await fetch(`/api/data/file?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch file data");
      const result = await response.json();
      setData(result as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && filePath) {
      refetch();
    }
  }, [autoFetch, filePath]);

  return { data, loading, error, refetch };
}
