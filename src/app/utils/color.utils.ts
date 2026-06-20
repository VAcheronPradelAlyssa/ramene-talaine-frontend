import { Listing } from '../models/listing.model';

export function getColorLabels(listing: Listing): string[] {
  const labels: string[] = [];

  if (Array.isArray(listing.colors)) {
    for (const color of listing.colors) {
      const colorData = color as any;
      const colorName = String(
        colorData?.colorName ??
        colorData?.name ??
        colorData?.label ??
        colorData?.value ??
        colorData?.color?.name ??
        colorData?.color?.label ??
        colorData?.color?.value ??
        ''
      ).trim();
      const customColor = String(
        colorData?.customColor ??
        colorData?.color?.customColor ??
        colorData?.color?.custom ??
        ''
      ).trim();

      if (colorName) {
        labels.push(colorName);
        continue;
      }
      if (customColor) {
        labels.push(customColor);
      }
    }
  }

  if (labels.length === 0) {
    const fallbackColor =
      typeof listing.color === 'string'
        ? listing.color.trim()
        : String(
            (listing.color as any)?.name ??
            (listing.color as any)?.label ??
            (listing.color as any)?.value ??
            ''
          ).trim();

    if (fallbackColor !== '') {
      labels.push(fallbackColor);
    }
  }

  return [...new Set(labels)];
}
