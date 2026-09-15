export const formatLabels = (
  items: string | string[] | null | undefined,
  constantsList: { key: string; label: string }[],
): string => {
  if (!items) return "미지정";

  let keyList: string[] = [];

  if (Array.isArray(items)) {
    keyList = items;
  } else if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      if (Array.isArray(parsed)) keyList = parsed;
      else keyList = [items];
    } catch {
      keyList = items.split(",").map((k) => k.trim());
    }
  }

  if (keyList.length === 0) return "미지정";

  const labels = keyList
    .map((key) => constantsList.find((item) => item.key === key)?.label)
    .filter(Boolean);

  return labels.length > 0 ? labels.join(", ") : "미지정";
};
