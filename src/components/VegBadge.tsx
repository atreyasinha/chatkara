import type { VegFlag } from "@/lib/types";

const colors: Record<VegFlag, string> = {
  veg: "border-veg text-veg",
  nonveg: "border-nonveg text-nonveg",
  egg: "border-egg text-egg",
};

const dots: Record<VegFlag, string> = {
  veg: "bg-veg",
  nonveg: "bg-nonveg",
  egg: "bg-egg",
};

export function VegBadge({
  veg,
  size = "sm",
}: {
  veg: VegFlag;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span
      className={`inline-flex items-center justify-center border ${box} ${colors[veg]}`}
      title={veg === "veg" ? "Vegetarian" : veg === "egg" ? "Contains egg" : "Non-vegetarian"}
      aria-label={veg}
    >
      <span className={`rounded-full ${dot} ${dots[veg]}`} />
    </span>
  );
}
