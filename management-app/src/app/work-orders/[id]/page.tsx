"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  WorkOrder,
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  ManufacturingStage,
} from "@/lib/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const ALL_STAGES: ManufacturingStage[] = [
  "design_approved",
  "yarn_planning",
  "tufting",
  "trimming",
  "washing",
  "drying",
  "finishing",
  "qc",
  "packing",
  "ready_to_ship",
];

export default function WorkOrderDetailPage() {
  const params = useParams();
  const { token, isAuthenticated } = useAuth();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const workOrderId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && token && workOrderId) {
      fetchWorkOrder();
    }
  }, [isAuthenticated, token, workOrderId]);

  const fetchWorkOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setWorkOrder(data.work_order);
      } else {
        throw new Error("Failed to fetch work order");
      }
    } catch (err) {
      console.error("Error fetching work order:", err);
      setError("Failed to load work order details");
    } finally {
      setLoading(false);
    }
  };

  const advanceStage = async () => {
    setAdvancing(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/${workOrderId}/stages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (response.ok) {
        fetchWorkOrder();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to advance stage");
      }
    } catch (err) {
      console.error("Error advancing stage:", err);
      alert("Failed to advance stage");
    } finally {
      setAdvancing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentStageIndex = () => {
    if (!workOrder) return -1;
    return ALL_STAGES.indexOf(workOrder.current_stage);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Work order not found"}</p>
          <Link
            href="/work-orders"
            className="mt-4 inline-block text-amber-500 hover:text-amber-400"
          >
            ← Back to Work Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const isCompleted =
    workOrder.status === "completed" ||
    workOrder.current_stage === "ready_to_ship";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/work-orders"
              className="text-gray-400 hover:text-gray-900 dark:text-white"
            >
              ← Back
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{workOrder.title}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {workOrder.sku && (
              <span className="mr-2">SKU: {workOrder.sku}</span>
            )}
            {workOrder.size && <span>Size: {workOrder.size}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[workOrder.priority]}`}
          >
            {workOrder.priority}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[workOrder.status]}`}
          >
            {workOrder.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">
          Production Progress
        </h2>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{
                width: `${(currentStageIndex / (ALL_STAGES.length - 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Stage Dots */}
          <div className="relative flex justify-between">
            {ALL_STAGES.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <div
                  key={stage}
                  className="flex flex-col items-center"
                  style={{ width: "10%" }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-gray-900 dark:text-white"
                        : isCurrent
                          ? `${STAGE_COLORS[stage]} border-white`
                          : "bg-gray-800 border-gray-600 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs text-center ${isCurrent ? "text-white font-medium" : "text-gray-500"}`}
                  >
                    {STAGE_LABELS[stage]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Stage & Advance Button */}
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Stage</p>
            <p
              className={`text-xl font-bold ${STAGE_COLORS[workOrder.current_stage].replace("bg-", "text-").replace("-500", "-400")}`}
            >
              {STAGE_LABELS[workOrder.current_stage]}
            </p>
          </div>
          {!isCompleted && (
            <button
              onClick={advanceStage}
              disabled={advancing}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              {advancing ? (
                "Advancing..."
              ) : (
                <>
                  Advance to Next Stage
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
          {isCompleted && (
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
              ✓ Production Complete
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Order ID</span>
              <Link
                href={`/orders/${workOrder.order_id}`}
                className="text-amber-500 hover:text-amber-400"
              >
                {workOrder.order_id.slice(0, 20)}...
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Due Date</span>
              <span className="text-gray-900 dark:text-white">
                {workOrder.due_date
                  ? formatDate(workOrder.due_date)
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Started</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(workOrder.started_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(workOrder.created_at)}
              </span>
            </div>
            {workOrder.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-green-400">
                  {formatDate(workOrder.completed_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
          {workOrder.notes ? (
            <p className="text-gray-300">{workOrder.notes}</p>
          ) : (
            <p className="text-gray-500 italic">No notes added</p>
          )}
        </div>

        {/* Stage History */}
        {workOrder.stages && workOrder.stages.length > 0 && (
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Stage History
            </h2>
            <div className="space-y-3">
              {workOrder.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        stage.status === "completed"
                          ? "bg-green-500"
                          : stage.status === "active"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-gray-900 dark:text-white">
                      {STAGE_LABELS[stage.stage as ManufacturingStage] ||
                        stage.stage}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm ${
                        stage.status === "completed"
                          ? "text-green-400"
                          : stage.status === "active"
                            ? "text-blue-400"
                            : "text-gray-500"
                      }`}
                    >
                      {stage.status}
                    </span>
                    {stage.completed_at && (
                      <p className="text-xs text-gray-500">
                        {formatDate(stage.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
