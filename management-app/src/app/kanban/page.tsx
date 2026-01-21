"use client";

import { useState } from "react";
import {
  STAGE_LABELS,
  STAGE_COLORS,
  ManufacturingStage,
  WorkOrder,
} from "@/lib/types";

// Visible stages for the Kanban board (excludes design_approved and ready_to_ship)
const KANBAN_STAGES: ManufacturingStage[] = [
  "yarn_planning",
  "tufting",
  "trimming",
  "washing",
  "drying",
  "finishing",
  "qc",
  "packing",
];

// Mock data
const mockWorkOrders: Partial<WorkOrder>[] = [
  {
    id: "wo_1",
    title: "Custom Moroccan 5x7",
    current_stage: "tufting",
    priority: "high",
    due_date: "2026-01-25",
  },
  {
    id: "wo_2",
    title: "Vintage Persian 8x10",
    current_stage: "washing",
    priority: "normal",
    due_date: "2026-01-26",
  },
  {
    id: "wo_3",
    title: "Modern Abstract 4x6",
    current_stage: "qc",
    priority: "urgent",
    due_date: "2026-01-22",
  },
  {
    id: "wo_4",
    title: "Bohemian Runner 2x8",
    current_stage: "packing",
    priority: "normal",
    due_date: "2026-01-23",
  },
  {
    id: "wo_5",
    title: "Classic Oriental 6x9",
    current_stage: "yarn_planning",
    priority: "low",
    due_date: "2026-01-30",
  },
  {
    id: "wo_6",
    title: "Tribal Geometric 4x4",
    current_stage: "tufting",
    priority: "normal",
    due_date: "2026-01-27",
  },
  {
    id: "wo_7",
    title: "Shag Cozy 5x7",
    current_stage: "trimming",
    priority: "high",
    due_date: "2026-01-24",
  },
  {
    id: "wo_8",
    title: "Jute Natural 3x5",
    current_stage: "drying",
    priority: "normal",
    due_date: "2026-01-28",
  },
  {
    id: "wo_9",
    title: "Silk Persian 6x9",
    current_stage: "finishing",
    priority: "urgent",
    due_date: "2026-01-23",
  },
  {
    id: "wo_10",
    title: "Cotton Flatweave",
    current_stage: "qc",
    priority: "normal",
    due_date: "2026-01-25",
  },
];

const PRIORITY_BORDER_COLORS = {
  low: "border-l-gray-500",
  normal: "border-l-blue-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

export default function KanbanPage() {
  const [workOrders] = useState(mockWorkOrders);

  const getOrdersByStage = (stage: ManufacturingStage) => {
    return workOrders.filter((wo) => wo.current_stage === stage);
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Production Board</h1>
          <p className="text-gray-400 mt-1">
            Drag cards to move work orders between stages
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span> Low
            <span className="w-3 h-3 rounded-full bg-blue-500 ml-2"></span>{" "}
            Normal
            <span className="w-3 h-3 rounded-full bg-orange-500 ml-2"></span>{" "}
            High
            <span className="w-3 h-3 rounded-full bg-red-500 ml-2"></span>{" "}
            Urgent
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {KANBAN_STAGES.map((stage) => {
            const orders = getOrdersByStage(stage);
            return (
              <div
                key={stage}
                className="w-72 flex-shrink-0 bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`}
                      ></span>
                      <h3 className="font-medium text-white text-sm">
                        {STAGE_LABELS[stage]}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {orders.map((wo) => (
                    <KanbanCard key={wo.id} workOrder={wo} />
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-sm">
                      No work orders
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <div className="p-3 border-t border-gray-800">
                  <button className="w-full py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition flex items-center justify-center gap-2">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Work Order
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ workOrder }: { workOrder: Partial<WorkOrder> }) {
  const priorityBorder = PRIORITY_BORDER_COLORS[workOrder.priority || "normal"];

  return (
    <div
      className={`bg-gray-800 rounded-lg p-3 border-l-4 ${priorityBorder} hover:bg-gray-750 transition cursor-grab active:cursor-grabbing group`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-medium text-white leading-tight">
          {workOrder.title}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Due: {workOrder.due_date}</span>
        {workOrder.priority === "urgent" && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            Urgent
          </span>
        )}
        {workOrder.priority === "high" && (
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            High
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button className="flex-1 py-1.5 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition">
          → Next Stage
        </button>
        <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition">
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
