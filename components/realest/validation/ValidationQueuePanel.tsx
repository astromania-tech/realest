"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@heroui/react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, RefreshCw, RotateCw } from "lucide-react";

type QueueJob = {
  job_id: string;
  property_id: string;
  job_status: "queued" | "processing" | "completed" | "failed";
  attempts: number;
  retry_count: number;
  source: string;
  last_error: string | null;
  failure_reason: string | null;
  final_property_status: string | null;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
  updated_at: string;
  next_retry_at: string | null;
  property_title: string;
  property_address: string;
  property_city: string;
  property_state: string | null;
  property_type: string;
  listing_type: string;
  property_price: string;
  property_status: string;
};

type QueueResponse = {
  data: QueueJob[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  metrics: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
    average_attempts: number;
    retryable_failed: number;
  };
};

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusTone(status: QueueJob["job_status"]) {
  switch (status) {
    case "queued":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "success";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export function ValidationQueuePanel() {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);
      const response = await fetch("/api/admin/validation/jobs?page=1&per_page=8&status=all", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Failed to load queue (${response.status})`);
      }

      const payload = (await response.json()) as QueueResponse;
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load queue");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadQueue();
    const interval = setInterval(() => void loadQueue(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const retryJob = async (jobId: string) => {
    try {
      setRetryingId(jobId);
      const response = await fetch(`/api/admin/validation/jobs/${jobId}/retry`, {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Retry failed (${response.status})`);
      }

      await loadQueue(true);
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : "Retry failed");
    } finally {
      setRetryingId(null);
    }
  };

  const failureRate = useMemo(() => {
    if (!data?.metrics.total) {
      return 0;
    }

    return Math.round((data.metrics.failed / data.metrics.total) * 100);
  }, [data]);

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-accent" />
            Live Validation Queue
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Real-time ML jobs backed by <code>property_validation_jobs</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{data?.metrics.queued ?? 0} queued</Badge>
          <Badge variant="outline">{data?.metrics.processing ?? 0} processing</Badge>
          <Badge variant="destructive">{data?.metrics.failed ?? 0} failed</Badge>
          <Button size="sm" variant="ghost" onClick={() => void loadQueue(true)} isDisabled={loading || refreshing}>
            <RotateCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg bg-gray-800/50 p-3">
          <div className="text-xs text-gray-400">Completed</div>
          <div className="text-xl font-semibold text-success">{data?.metrics.completed ?? 0}</div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-3">
          <div className="text-xs text-gray-400">Retryable</div>
          <div className="text-xl font-semibold text-warning">{data?.metrics.retryable_failed ?? 0}</div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-3">
          <div className="text-xs text-gray-400">Average Attempts</div>
          <div className="text-xl font-semibold text-brand-accent">{(data?.metrics.average_attempts ?? 0).toFixed(1)}</div>
        </div>
        <div className="rounded-lg bg-gray-800/50 p-3">
          <div className="text-xs text-gray-400">Failure Rate</div>
          <div className="text-xl font-semibold text-danger">{failureRate}%</div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 text-sm text-gray-400">
            Loading validation jobs...
          </div>
        ) : data?.data.length ? (
          data.data.map((job) => {
            const canRetry = job.job_status === "failed";
            return (
              <div key={job.job_id} className="rounded-lg border border-gray-800 bg-gray-800/40 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statusTone(job.job_status) as never}>{job.job_status}</Badge>
                      <span className="text-sm text-white font-medium truncate">{job.property_title}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {job.property_address}, {job.property_city}{job.property_state ? `, ${job.property_state}` : ""}
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                      <div>
                        <div className="uppercase tracking-wider">Attempts</div>
                        <div className="text-gray-200 text-sm">{job.attempts}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wider">Retry Count</div>
                        <div className="text-gray-200 text-sm">{job.retry_count}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wider">Queued</div>
                        <div className="text-gray-200 text-sm">{formatTime(job.queued_at)}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-wider">Next Retry</div>
                        <div className="text-gray-200 text-sm">{formatTime(job.next_retry_at)}</div>
                      </div>
                    </div>
                    {job.failure_reason ? (
                      <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        {job.failure_reason}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-55">
                    <div className="text-xs text-gray-400">Current status</div>
                    <div className="text-sm text-gray-200">Property: {job.property_status}</div>
                    <div className="text-sm text-gray-200">Final: {job.final_property_status ?? "—"}</div>
                    <Progress value={Math.min(100, Math.max(0, job.attempts * 25))} className="h-2" />
                    <Button size="sm" variant="ghost" isDisabled={!canRetry || retryingId === job.job_id} onClick={() => void retryJob(job.job_id)}>
                      {retryingId === job.job_id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-pulse" />
                          Retrying
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Retry job
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-lg border border-gray-800 bg-gray-800/40 p-4 text-sm text-gray-400">
            No validation jobs found yet.
          </div>
        )}
      </div>
    </Card>
  )
}