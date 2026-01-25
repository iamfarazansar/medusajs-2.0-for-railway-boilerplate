import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { ProductStatus, Modules } from "@medusajs/framework/utils";

/**
 * Product creation endpoint following official Medusa AdminCreateProduct type
 *
 * Options format: { title: string, values: string[] }[]
 * Variants format: { title, sku?, prices[], options?: Record<string, string> }[]
 *   - options maps option title to selected value, e.g. { "Size": "Small", "Color": "Blue" }
 * Categories format: { id: string }[] (not category_ids)
 */

interface CreateProductInput {
  title: string;
  description?: string;
  handle?: string;
  status?: "draft" | "published";
  images?: { url: string }[];
  options?: { title: string; values: string[] }[];
  variants?: {
    title: string;
    sku?: string;
    options?: Record<string, string>;
    prices: {
      amount: number;
      currency_code: string;
      rules?: { region_id: string };
    }[];
    manage_inventory?: boolean;
  }[];
  weight?: number;
  collection_id?: string;
  categories?: { id: string }[];
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = req.body as CreateProductInput;

    // Validate required fields
    if (!input.title) {
      return res.status(400).json({ error: "Product title is required" });
    }

    // Build product data matching AdminCreateProduct type
    const productData: any = {
      title: input.title,
      description: input.description || "",
      handle:
        input.handle ||
        input.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      status:
        input.status === "published"
          ? ProductStatus.PUBLISHED
          : ProductStatus.DRAFT,
      images: input.images || [],
    };

    // Add optional fields
    if (input.weight) {
      productData.weight = input.weight;
    }
    if (input.collection_id) {
      productData.collection_id = input.collection_id;
    }

    // Categories use { id } format
    if (input.categories && input.categories.length > 0) {
      productData.categories = input.categories;
    }

    // Process options - filter out empty ones and ensure values are non-empty
    if (input.options && input.options.length > 0) {
      productData.options = input.options
        .filter((o) => o.title && o.values && o.values.length > 0)
        .map((o) => ({
          title: o.title.trim(),
          values: o.values
            .filter((v) => v && v.trim().length > 0)
            .map((v) => v.trim()),
        }))
        .filter((o) => o.values.length > 0);
    } else {
      productData.options = [];
    }

    // Build variants
    if (input.variants && input.variants.length > 0) {
      productData.variants = input.variants
        .filter((v) => v.title)
        .map((v) => {
          const variant: any = {
            title: v.title,
            prices: v.prices,
            manage_inventory: v.manage_inventory ?? false,
          };
          if (v.sku) {
            variant.sku = v.sku;
          }
          // Options maps option title to selected value
          if (v.options && Object.keys(v.options).length > 0) {
            variant.options = v.options;
          }
          return variant;
        });
    } else {
      // Create a default variant if none provided
      productData.variants = [
        {
          title: "Default",
          prices: [{ amount: 0, currency_code: "usd" }],
          manage_inventory: false,
        },
      ];
    }

    console.log(
      "Creating product with data:",
      JSON.stringify(productData, null, 2),
    );

    // Run the createProductsWorkflow
    const { result } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [productData],
      },
    });

    return res.status(201).json({
      product: result[0],
      message: "Product created successfully",
    });
  } catch (error: any) {
    console.error("Product creation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to create product",
    });
  }
}

// GET endpoint to fetch categories and collections for the form
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Get product categories using Modules constant
    const productModule = req.scope.resolve(Modules.PRODUCT) as any;

    let categories: any[] = [];
    let collections: any[] = [];

    try {
      const [cats] = await productModule.listAndCountProductCategories(
        {},
        { take: 100, order: { name: "ASC" } },
      );
      categories = cats || [];
    } catch (e) {
      console.log("No categories or error fetching:", e);
    }

    try {
      const [colls] = await productModule.listAndCountProductCollections(
        {},
        { take: 100, order: { title: "ASC" } },
      );
      collections = colls || [];
    } catch (e) {
      console.log("No collections or error fetching:", e);
    }

    return res.json({
      categories,
      collections,
    });
  } catch (error: any) {
    console.error("Error fetching form data:", error);
    return res.status(500).json({ error: error.message });
  }
}
