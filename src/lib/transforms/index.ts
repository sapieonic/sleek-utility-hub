import type { Category, TransformDef } from "./types";
import { formatters } from "./formatters";
import { encoders } from "./encoders";
import { converters } from "./converters";
import { textTransforms } from "./text";

export * from "./types";
export * from "./util";

export const ALL_TRANSFORMS: TransformDef[] = [
  ...formatters,
  ...encoders,
  ...converters,
  ...textTransforms,
];

export const TRANSFORMS_BY_ID = new Map(ALL_TRANSFORMS.map((t) => [t.id, t]));

export function getTransform(id: string): TransformDef | undefined {
  return TRANSFORMS_BY_ID.get(id);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  formatters: "Formatters",
  encoders: "Encoders",
  converters: "Converters",
  text: "Text",
};

export const CATEGORY_ORDER: Category[] = ["formatters", "encoders", "converters", "text"];

export function transformsByCategory(category: Category): TransformDef[] {
  return ALL_TRANSFORMS.filter((t) => t.category === category);
}

/** Old per-tool route -> the transform that replaced it. */
export const LEGACY_ROUTES: Record<string, string> = ALL_TRANSFORMS.reduce(
  (acc, t) => {
    for (const path of t.legacyPaths ?? []) {
      if (!acc[path]) acc[path] = t.id;
    }
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Still on the roadmap. These are deliberately kept out of the library and the
 * palette — a tool that does nothing is worse than a tool that is absent.
 */
export const UNBUILT_TOOLS = [
  "Test Data Generator",
  "Lorem Ipsum Generator",
  "Credit Card Generator",
  "Placeholder Image Generator",
  "QR Code Generator",
  "QR Code Scanner",
  "Code Share",
  "JS Compressor",
];
