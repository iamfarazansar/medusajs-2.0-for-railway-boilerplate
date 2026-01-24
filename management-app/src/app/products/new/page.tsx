"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProductFormData, ProductOption, ProductVariant } from "@/lib/types";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function CreateProductPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  // Store raw text for option values (allows natural typing with commas)
  const [optionValuesText, setOptionValuesText] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { title: "Default", prices: [{ amount: 0, currency_code: "usd" }] },
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Load form data
  useEffect(() => {
    if (isAuthenticated && token) {
      loadFormData();
    }
  }, [isAuthenticated, token]);

  const loadFormData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/custom-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      }
    } catch (err) {
      console.error("Failed to load form data:", err);
    }
  };

  // Auto-generate handle from title
  useEffect(() => {
    if (title && !handle) {
      setHandle(
        title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }, [title, handle]);

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  // Image upload handler
  const handleImageUpload = useCallback(
    async (files: FileList) => {
      if (!token) return;

      const newImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const previewUrl = URL.createObjectURL(file);

        newImages.push({
          id: tempId,
          url: previewUrl,
          file,
          uploading: true,
        });
      }

      setImages((prev) => [...prev, ...newImages]);

      // Upload each file
      for (const img of newImages) {
        if (!img.file) continue;

        try {
          // Convert file to base64
          const base64Content = await fileToBase64(img.file);

          const response = await fetch(`${BACKEND_URL}/admin/product-uploads`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file: base64Content,
              filename: img.file.name,
              mimeType: img.file.type,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || "Upload failed");
          }

          const result = await response.json();
          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id
                ? {
                    ...i,
                    id: result.file.id,
                    url: result.file.url,
                    uploading: false,
                  }
                : i,
            ),
          );
        } catch (err) {
          console.error("Upload failed:", err);
          setImages((prev) => prev.filter((i) => i.id !== img.id));
          setError(`Failed to upload ${img.file.name}`);
        }
      }
    },
    [token],
  );

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  // Option management
  const addOption = () => {
    setOptions([...options, { title: "", values: [] }]);
    setOptionValuesText([...optionValuesText, ""]);
  };

  const updateOption = (
    index: number,
    field: "title" | "values",
    value: string | string[],
  ) => {
    const newOptions = [...options];
    if (field === "title") {
      newOptions[index].title = value as string;
    } else {
      newOptions[index].values = value as string[];
    }
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setOptionValuesText(optionValuesText.filter((_, i) => i !== index));
  };

  // Variant management
  const addVariant = () => {
    setVariants([
      ...variants,
      { title: "", prices: [{ amount: 0, currency_code: "usd" }] },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | ProductVariant["prices"],
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === "title") return { ...v, title: value as string };
        if (field === "sku") return { ...v, sku: value as string };
        if (field === "prices")
          return { ...v, prices: value as ProductVariant["prices"] };
        return v;
      }),
    );
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out still-uploading images
      const uploadedImages = images
        .filter((img) => !img.uploading)
        .map((img) => ({ url: img.url }));

      const productData = {
        title,
        description,
        handle,
        status,
        images: uploadedImages,
        options: options
          .filter((o) => o.title && o.values.length > 0)
          .map((o) => ({
            title: o.title.trim(),
            values: o.values.filter((v) => v.trim().length > 0),
          })),
        variants: variants
          .filter((v) => v.title)
          .map((v) => ({
            ...v,
            prices: v.prices.map((p) => ({
              ...p,
              amount: Math.round(p.amount * 100), // Convert to cents
            })),
          })),
        // Use categories: [{id}] format per Medusa types
        categories:
          selectedCategories.length > 0
            ? selectedCategories.map((id) => ({ id }))
            : undefined,
        collection_id: selectedCollection || undefined,
      };

      const response = await fetch(`${BACKEND_URL}/admin/custom-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      router.push("/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Product
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="product-handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published")
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Images
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload product images (up to 50MB each)
            </p>

            {/* Upload area */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById("image-upload")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  handleImageUpload(e.dataTransfer.files);
                }
              }}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(e.target.files);
                  }
                }}
              />
              <div className="text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm">PNG, JPG, GIF up to 50MB</p>
              </div>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Preview"
                      className={`w-full h-24 object-cover rounded-lg ${
                        img.uploading ? "opacity-50" : ""
                      }`}
                    />
                    {img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    {!img.uploading && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Options
              </h2>
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                + Add Option
              </button>
            </div>

            {options.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No options added. Add options like Size, Color, etc.
              </p>
            ) : (
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.title}
                        onChange={(e) =>
                          updateOption(index, "title", e.target.value)
                        }
                        placeholder="Option name (e.g., Size)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={
                          optionValuesText[index] ?? option.values.join(", ")
                        }
                        onChange={(e) => {
                          // Just update the raw text, don't split yet
                          setOptionValuesText((prev) => {
                            const updated = [...prev];
                            updated[index] = e.target.value;
                            return updated;
                          });
                        }}
                        onBlur={(e) => {
                          // Split and update on blur
                          const values = e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter((v) => v.length > 0);
                          updateOption(index, "values", values);
                        }}
                        placeholder="Values (comma-separated, e.g. Small, Medium, Large)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Variants & Pricing
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                + Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Variant Title
                      </label>
                      <input
                        type="text"
                        value={variant.title}
                        onChange={(e) =>
                          updateVariant(index, "title", e.target.value)
                        }
                        placeholder="e.g., Small / Blue"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        placeholder="SKU-001"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Price (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.prices[0]?.amount || 0}
                        onChange={(e) =>
                          updateVariant(index, "prices", [
                            {
                              amount: parseFloat(e.target.value) || 0,
                              currency_code: "usd",
                            },
                          ])
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-500 hover:text-red-700 mt-5"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories & Collections */}
          {formData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Organization
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.collections.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Collection
                    </label>
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a collection</option>
                      {formData.collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categories
                    </label>
                    <select
                      multiple
                      value={selectedCategories}
                      onChange={(e) =>
                        setSelectedCategories(
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      size={3}
                    >
                      {formData.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
