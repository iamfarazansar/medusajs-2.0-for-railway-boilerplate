"use client";

import { useState } from "react";
import { Artisan } from "@/lib/types";

// Mock data
const mockArtisans: Artisan[] = [
  {
    id: "artisan_1",
    name: "Ahmed Khan",
    email: "ahmed@ruggyland.com",
    phone: "+92 300 1234567",
    role: "Master Weaver",
    specialties: ["tufting", "finishing"],
    active: true,
    completed_orders: 156,
    average_rating: 4.8,
  },
  {
    id: "artisan_2",
    name: "Fatima Hassan",
    email: "fatima@ruggyland.com",
    phone: "+92 300 2345678",
    role: "QC Specialist",
    specialties: ["qc", "trimming"],
    active: true,
    completed_orders: 342,
    average_rating: 4.9,
  },
  {
    id: "artisan_3",
    name: "Ali Raza",
    email: "ali@ruggyland.com",
    phone: "+92 300 3456789",
    role: "Yarn Specialist",
    specialties: ["yarn_planning", "tufting"],
    active: true,
    completed_orders: 89,
    average_rating: 4.5,
  },
  {
    id: "artisan_4",
    name: "Zara Malik",
    email: "zara@ruggyland.com",
    phone: "+92 300 4567890",
    role: "Finishing Expert",
    specialties: ["washing", "drying", "finishing"],
    active: false,
    completed_orders: 203,
    average_rating: 4.7,
  },
];

export default function ArtisansPage() {
  const [artisans] = useState<Artisan[]>(mockArtisans);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesSearch =
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || artisan.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const uniqueRoles = [...new Set(artisans.map((a) => a.role).filter(Boolean))];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Artisans</h1>
          <p className="text-gray-400 mt-1">Manage your manufacturing team</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition flex items-center gap-2"
        >
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
          Add Artisan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Artisans</p>
          <p className="text-2xl font-bold text-white mt-1">
            {artisans.length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {artisans.filter((a) => a.active).length}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Total Completed</p>
          <p className="text-2xl font-bold text-white mt-1">
            {artisans.reduce((sum, a) => sum + a.completed_orders, 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <p className="text-sm text-gray-400">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {(
              artisans.reduce((sum, a) => sum + (a.average_rating || 0), 0) /
              artisans.length
            ).toFixed(1)}{" "}
            ⭐
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
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Artisans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtisans.map((artisan) => (
          <div
            key={artisan.id}
            className={`bg-gray-900 rounded-xl border ${artisan.active ? "border-gray-800" : "border-red-900/30"} p-6 hover:border-gray-700 transition`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${artisan.active ? "bg-amber-500/20 text-amber-400" : "bg-gray-700 text-gray-400"}`}
                >
                  {artisan.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="text-white font-medium">{artisan.name}</h3>
                  <p className="text-sm text-gray-500">{artisan.role}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${artisan.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
              >
                {artisan.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {artisan.email}
              </div>
              {artisan.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {artisan.phone}
                </div>
              )}
            </div>

            {/* Specialties */}
            {artisan.specialties && artisan.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {artisan.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                  >
                    {specialty.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-white">
                  {artisan.completed_orders}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rating</p>
                <p className="text-lg font-bold text-amber-400">
                  {artisan.average_rating} ⭐
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                View Work
              </button>
              <button className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
