export function formatPrice(amount: number | undefined | null, symbol = '$'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0`;
  // Formats as Argentine/Latin currency e.g. 19530 -> $19.530
  const formatted = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function parsePriceInput(val: string): number {
  // Cleans $ or dots or commas: "$ 19.530" -> 19530
  const cleaned = val.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function getTagStyle(tag: string): { bg: string; text: string; border: string } {
  switch (tag.toLowerCase()) {
    case 'veggie':
      return {
        bg: 'bg-[#93C2BC]/20',
        text: 'text-[#2E5E58]',
        border: 'border-[#93C2BC]/40',
      };
    case 'picante':
      return {
        bg: 'bg-[#DC5D5D]/20',
        text: 'text-[#943535]',
        border: 'border-[#DC5D5D]/40',
      };
    case 'favorito':
      return {
        bg: 'bg-[#DC5D5D]/15',
        text: 'text-[#DC5D5D]',
        border: 'border-[#DC5D5D]/30',
      };
    case 'para compartir':
      return {
        bg: 'bg-[#B0AF9F]/25',
        text: 'text-[#3C3C3B]',
        border: 'border-[#B0AF9F]/50',
      };
    default:
      return {
        bg: 'bg-[#3C3C3B]/10',
        text: 'text-[#3C3C3B]',
        border: 'border-[#3C3C3B]/20',
      };
  }
}
