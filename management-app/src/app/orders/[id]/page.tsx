"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface OrderItem {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant_title: string;
  product_title: string;
}

interface Order {
  id: string;
  display_id: number;
  email: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency_code: string;
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  created_at: string;
  customer: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  } | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  } | null;
  billing_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
  } | null;
  items: OrderItem[];
  shipping_methods: {
    id: string;
    name: string;
    amount: number;
  }[];
}

interface WorkOrder {
  id: string;
  title: string;
  current_stage: string;
  status: string;
  priority: string;
}

const FULFILLMENT_COLORS: Record<string, string> = {
  not_fulfilled: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
  partially_fulfilled: "bg-blue-500/20 text-blue-400",
  fulfilled: "bg-green-500/20 text-green-400",
  shipped: "bg-purple-500/20 text-purple-400",
};

const PAYMENT_COLORS: Record<string, string> = {
  awaiting: "bg-yellow-500/20 text-yellow-400",
  captured: "bg-green-500/20 text-green-400",
  refunded: "bg-red-500/20 text-red-400",
  partially_refunded: "bg-orange-500/20 text-orange-400",
  not_paid: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingWorkOrders, setCreatingWorkOrders] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (isAuthenticated && token && orderId) {
      fetchOrder();
      fetchWorkOrders();
    }
  }, [isAuthenticated, token, orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        throw new Error("Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders?order_id=${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.work_orders || []);
      }
    } catch (err) {
      console.error("Error fetching work orders:", err);
    }
  };

  const createWorkOrders = async () => {
    setCreatingWorkOrders(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/admin/work-orders/from-order/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priority: "normal" }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Created ${data.work_orders?.length || 0} work order(s)!`);
        fetchWorkOrders();
      } else {
        alert(data.message || "Failed to create work orders");
      }
    } catch (err) {
      console.error("Error creating work orders:", err);
      alert("Failed to create work orders");
    } finally {
      setCreatingWorkOrders(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || "Order not found"}</p>
          <Link
            href="/orders"
            className="mt-4 inline-block text-amber-500 hover:text-amber-400"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/orders" className="text-gray-400 hover:text-gray-900 dark:text-white">
              ← Back
            </Link>
            <span className="text-gray-600">|</span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order #{order.display_id}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${PAYMENT_COLORS[order.payment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
          >
            {order.payment_status?.replace("_", " ")}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${FULFILLMENT_COLORS[order.fulfillment_status] || "bg-gray-500/20 text-gray-600 dark:text-gray-400"}`}
          >
            {order.fulfillment_status?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">
                      {item.product_title || item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.variant_title || item.subtitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-white font-medium">
                        {formatCurrency(item.total, order.currency_code)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(order.subtotal || 0, order.currency_code)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>
                  {formatCurrency(
                    order.shipping_total || 0,
                    order.currency_code,
                  )}
                </span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>
                    -{formatCurrency(order.discount_total, order.currency_code)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>
                  {formatCurrency(order.tax_total || 0, order.currency_code)}
                </span>
              </div>
              <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total</span>
                <span>{formatCurrency(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>

          {/* Work Orders */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Work Orders</h2>
              {workOrders.length === 0 && (
                <button
                  onClick={createWorkOrders}
                  disabled={creatingWorkOrders}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium rounded-lg transition"
                >
                  {creatingWorkOrders ? "Creating..." : "+ Create Work Orders"}
                </button>
              )}
            </div>

            {workOrders.length > 0 ? (
              <div className="space-y-3">
                {workOrders.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders`}
                    className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                  >
                    <div>
                      <p className="text-white font-medium">{wo.title}</p>
                      <p className="text-sm text-gray-500">
                        Stage: {wo.current_stage}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        wo.priority === "urgent"
                          ? "bg-red-500/20 text-red-400"
                          : wo.priority === "high"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No work orders created yet</p>
                <p className="text-sm mt-1">
                  Click the button above to create work orders for this order
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900 dark:text-white">
                  {order.customer?.first_name || order.customer?.last_name
                    ? `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim()
                    : "Guest"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 dark:text-white">
                  {order.email || order.customer?.email || "N/A"}
                </p>
              </div>
              {order.customer?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 dark:text-white">{order.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Shipping Address
              </h2>
              <div className="text-gray-300 space-y-1">
                <p>
                  {order.shipping_address.first_name}{" "}
                  {order.shipping_address.last_name}
                </p>
                <p>{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && (
                  <p>{order.shipping_address.address_2}</p>
                )}
                <p>
                  {order.shipping_address.city},{" "}
                  {order.shipping_address.province}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p className="uppercase">
                  {order.shipping_address.country_code}
                </p>
                {order.shipping_address.phone && (
                  <p className="text-gray-500 mt-2">
                    {order.shipping_address.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shipping Method */}
          {order.shipping_methods?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Shipping Method
              </h2>
              {order.shipping_methods.map((method) => (
                <div key={method.id} className="flex justify-between">
                  <span className="text-gray-300">{method.name}</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(method.amount, order.currency_code)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Billing Address */}
          {order.billing_address && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Billing Address
              </h2>
              <div className="text-gray-300 space-y-1">
                <p>
                  {order.billing_address.first_name}{" "}
                  {order.billing_address.last_name}
                </p>
                <p>{order.billing_address.address_1}</p>
                {order.billing_address.address_2 && (
                  <p>{order.billing_address.address_2}</p>
                )}
                <p>
                  {order.billing_address.city}, {order.billing_address.province}{" "}
                  {order.billing_address.postal_code}
                </p>
                <p className="uppercase">
                  {order.billing_address.country_code}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
