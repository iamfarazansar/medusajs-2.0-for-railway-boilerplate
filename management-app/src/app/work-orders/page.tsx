"use client";

import { useState } from "react";
import {
  WorkOrder,
  STAGE_LABELS,
  STAGE_COLORS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  ManufacturingStage,
  Priority,
  WorkOrderStatus,
} from "@/lib/types";

// Mock data - will be replaced with API calls
const mockWorkOrders: WorkOrder[] = [
  {
    id: "wo_1",
    order_id: "order_abc123",
    order_item_id: "item_1",
    title: "Custom Moroccan Rug 5x7",
    size: "5x7 ft",
    sku: "RUG-MOR-5x7",
    current_stage: "tufting",
    status: "in_progress",
    priority: "high",
    assigned_to: "artisan_1",
    due_date: "2026-01-25",
    started_at: "2026-01-18",
    completed_at: null,
    notes: "Customer requested specific pattern",
    created_at: "2026-01-15",
    updated_at: "2026-01-20",
  },
  {
    id: "wo_2",
    order_id: "order_def456",
    order_item_id: "item_2",
    title: "Vintage Persian 8x10",
    size: "8x10 ft",
    sku: "RUG-PER-8x10",
    current_stage: "washing",
    status: "in_progress",
    priority: "normal",
    assigned_to: "artisan_2",
    due_date: "2026-01-26",
    started_at: "2026-01-16",
    completed_at: null,
    notes: null,
    created_at: "2026-01-14",
    updated_at: "2026-01-21",
  },
  {
    id: "wo_3",
    order_id: "order_ghi789",
    order_item_id: "item_3",
    title: "Modern Abstract 4x6",
    size: "4x6 ft",
    sku: "RUG-ABS-4x6",
    current_stage: "qc",
    status: "in_progress",
    priority: "urgent",
    assigned_to: null,
    due_date: "2026-01-22",
    started_at: "2026-01-10",
    completed_at: null,
    notes: "Rush order - VIP customer",
    created_at: "2026-01-08",
    updated_at: "2026-01-21",
  },
  {
    id: "wo_4",
    order_id: "order_jkl012",
    order_item_id: "item_4",
    title: "Bohemian Runner 2x8",
    size: "2x8 ft",
    sku: "RUG-BOH-2x8",
    current_stage: "packing",
    status: "in_progress",
    priority: "normal",
    assigned_to: "artisan_3",
    due_date: "2026-01-23",
    started_at: "2026-01-12",
    completed_at: null,
    notes: null,
    created_at: "2026-01-10",
    updated_at: "2026-01-21",
  },
  {
    id: "wo_5",
    order_id: "order_mno345",
    order_item_id: "item_5",
    title: "Classic Oriental 6x9",
    size: "6x9 ft",
    sku: "RUG-ORI-6x9",
    current_stage: "design_approved",
    status: "pending",
    priority: "low",
    assigned_to: null,
    due_date: "2026-01-30",
    started_at: null,
    completed_at: null,
    notes: null,
    created_at: "2026-01-20",
    updated_at: "2026-01-20",
  },
  {
    id: "wo_6",
    order_id: "order_pqr678",
    order_item_id: "item_6",
    title: "Geometric Kilim 5x8",
    size: "5x8 ft",
    sku: "RUG-KIL-5x8",
    current_stage: "ready_to_ship",
    status: "completed",
    priority: "normal",
    assigned_to: "artisan_1",
    due_date: "2026-01-20",
    started_at: "2026-01-05",
    completed_at: "2026-01-19",
    notes: "Excellent quality",
    created_at: "2026-01-03",
    updated_at: "2026-01-19",
  },
];

export default function WorkOrdersPage() {
  const [filter, setFilter] = useState<{
    stage: ManufacturingStage | "all";
    status: WorkOrderStatus | "all";
    priority: Priority | "all";
  }>({
    stage: "all",
    status: "all",
    priority: "all",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = mockWorkOrders.filter((wo) => {
    if (filter.stage !== "all" && wo.current_stage !== filter.stage)
      return false;
    if (filter.status !== "all" && wo.status !== filter.status) return false;
    if (filter.priority !== "all" && wo.priority !== filter.priority)
      return false;
    if (
      searchQuery &&
      !wo.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Work Orders</h1>
          <p className="text-gray-400 mt-1">Manage production work orders</p>
        </div>
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition flex items-center gap-2">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Work Order
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={filter.stage}
            onChange={(e) =>
              setFilter({
                ...filter,
                stage: e.target.value as ManufacturingStage | "all",
              })
            }
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Stages</option>
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) =>
              setFilter({
                ...filter,
                status: e.target.value as WorkOrderStatus | "all",
              })
            }
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filter.priority}
            onChange={(e) =>
              setFilter({
                ...filter,
                priority: e.target.value as Priority | "all",
              })
            }
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredOrders.length} of {mockWorkOrders.length} work orders
      </p>

      {/* Work Orders Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Work Order
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Stage
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredOrders.map((wo) => (
              <tr
                key={wo.id}
                className="hover:bg-gray-800/50 transition cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">{wo.title}</p>
                    <p className="text-xs text-gray-500">
                      {wo.sku} • {wo.size}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${STAGE_COLORS[wo.current_stage]}`}
                  >
                    {STAGE_LABELS[wo.current_stage]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[wo.status]}`}
                  >
                    {wo.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${PRIORITY_COLORS[wo.priority]}`}
                  >
                    {wo.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-300">{wo.due_date || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-gray-700 rounded-lg transition"
                      title="View Details"
                    >
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
                    <button
                      className="p-2 hover:bg-gray-700 rounded-lg transition"
                      title="Advance Stage"
                    >
                      <svg
                        className="w-4 h-4 text-green-400"
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
                    </button>
                    <button
                      className="p-2 hover:bg-gray-700 rounded-lg transition"
                      title="Edit"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
