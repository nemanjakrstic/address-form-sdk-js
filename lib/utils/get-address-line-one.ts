export const getAddressLineOne = (
  label: string,
  {
    country,
    locality,
    city,
    postalCode,
    district,
    subDistrict,
  }: {
    country?: string;
    locality?: string;
    city?: string;
    postalCode?: string;
    district?: string;
    subDistrict?: string;
  } = {},
  isRTL?: boolean,
): string => {
  const parts = label.split(",").map((part) => part.trim());

  if (parts.length <= 2) {
    return parts.join(", ");
  }

  const toRemove = [country, locality, city, postalCode, district, subDistrict].filter(Boolean);

  for (const item of toRemove) {
    if (parts.length <= 2) break;

    const index = isRTL
      ? parts.findIndex((part) => part.includes(item!))
      : findLastIndex(parts, (part) => part.includes(item!));

    if (index !== -1) {
      parts.splice(index, 1);
    }
  }

  return parts.slice(0, 2).join(", ");
};

const findLastIndex = <T>(array: T[], predicate: (item: T) => boolean): number => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
};
