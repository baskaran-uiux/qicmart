/**
 * Formats a price with the appropriate currency symbol.
 */
export function formatPrice(price: number, currencyCode: string = "INR"): string {
    const symbols: Record<string, string> = {
        USD: "$",
        INR: "₹",
        MYR: "RM",
        EUR: "€",
        GBP: "£",
        AED: "DH",
        SAR: "SR",
        BDT: "৳",
        PKR: "Rs",
    }

    const symbol = symbols[currencyCode] || symbols.INR
    const formattedPrice = price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    // RM usually has a space
    if (currencyCode === "MYR") return `${symbol} ${formattedPrice}`
    
    return `${symbol}${formattedPrice}`
}
