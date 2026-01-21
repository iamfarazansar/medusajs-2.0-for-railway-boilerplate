"use client";

import { useState, useEffect } from "react";

interface Order {
  id: string;
  display_id: number;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
  total: number;
  currency_code: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  items_count?: number;
}

// Mock data - will be replaced with API calls
const mockOrders: Order[] = [
  {
    id: "order_abc123",
    display_id: 1001,
    customer: {
      email: "john@example.com",
      first_name: "John",
      last_name: "Doe",
    },
    total: 45000,
    currency_code: "usd",
    status: "pending",
    payment_status: "captured",
    fulfillment_status: "not_fulfilled",
    created_at: "2026-01-20T10:00:00Z",
    items_count: 2,
  },
  {
    id: "order_def456",
    display_id: 1002,
    customer: {
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Smith",
    },
    total: 82500,
    currency_code: "usd",
    status: "pending",
    payment_status: "captured",
    fulfillment_status: "partially_fulfilled",
    created_at: "2026-01-19T14:30:00Z",
    items_count: 3,
  },
  {
    id: "order_ghi789",
    display_id: 1003,
    customer: {
      email: "bob@example.com",
      first_name: "Bob",
      last_name: "Johnson",
    },
    total: 125000,
    currency_code: "usd",
    status: "completed",
    payment_status: "captured",
    fulfillment_status: "fulfilled",
    created_at: "2026-01-18T09:15:00Z",
    items_count: 1,
  },
  {
    id: "order_jkl012",
    display_id: 1004,
    customer: {
      email: "alice@example.com",
      first_name: "Alice",
      last_name: "Williams",
    },
    total: 67500,
    currency_code: "usd",
    status: "pending",
    payment_status: "awaiting",
    fulfillment_status: "not_fulfilled",
    created_at: "2026-01-21T08:00:00Z",
    items_count: 2,
  },
];

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  archived: "bg-gray-500/20 text-gray-400",
};

const FULFILLMENT_COLORS = {
  not_fulfilled: "bg-gray-500/20 text-gray-400",
  partially_fulfilled: "bg-blue-500/20 text-blue-400",
  fulfilled: "bg-green-500/20 text-green-400",
  shipped: "bg-purple-500/20 text-purple-400",
};

const PAYMENT_COLORS = {
  awaiting: "bg-yellow-500/20 text-yellow-400",
  captured: "bg-green-500/20 text-green-400",
  refunded: "bg-red-500/20 text-red-400",
  partially_refunded: "bg-orange-500/20 text-orange-400",
};

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.display_id.toString().includes(searchQuery) ||
      order.customer?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.first_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.customer?.last_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.fulfillment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 mt-1">
            Manage customer orders and create work orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by order ID, customer email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Fulfillment Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Fulfillment</option>
            <option value="not_fulfilled">Not Fulfilled</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {/* Orders Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Order
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fulfillment
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-800/50 transition cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      #{order.display_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.items_count} item(s)
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-white">
                      {order.customer?.first_name} {order.customer?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.customer?.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(order.total, order.currency_code)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.payment_status as keyof typeof PAYMENT_COLORS] || "bg-gray-500/20 text-gray-400"}`}
                  >
                    {order.payment_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${FULFILLMENT_COLORS[order.fulfillment_status as keyof typeof FULFILLMENT_COLORS] || "bg-gray-500/20 text-gray-400"}`}
                  >
                    {order.fulfillment_status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-300">
                    {formatDate(order.created_at)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-medium rounded-lg transition"
                      title="Create work orders for this order"
                    >
                      + Work Orders
                    </button>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">
              Create Work Orders
            </p>
            <p className="text-xs text-blue-400/70 mt-1">
              Click "+ Work Orders" to automatically create manufacturing work
              orders for each item in the order. This will create one work order
              per item quantity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
