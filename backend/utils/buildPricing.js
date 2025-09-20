export function buildPricing(product, discounts) {
  const originalPrice = product.price;
  let bestDiscountAmount = 0;
  let bestDiscount = null;

  // Treat product as a cartItem with quantity 1
  const cartItems = [{ product, quantity: 1 }];

  for (const discount of discounts) {
    if (discount.appliesTo(cartItems)) {
      const discountAmount = discount.calculateDiscount(
        cartItems,
        originalPrice
      );
      if (discountAmount > bestDiscountAmount) {
        bestDiscountAmount = discountAmount;
        bestDiscount = discount;
      }
    }
  }

  const discountedPrice = Math.max(originalPrice - bestDiscountAmount, 0);
  const discountPercentage = originalPrice
    ? Math.round((bestDiscountAmount / originalPrice) * 100)
    : 0;

  return {
    originalPrice,
    discountedPrice,
    discountPercentage,
    savings: bestDiscountAmount,
    hasDiscount: bestDiscountAmount > 0,
    appliedDiscounts: bestDiscount
      ? [
          {
            id: bestDiscount._id,
            name: bestDiscount.name,
            type: bestDiscount.rules.map((r) => r.type),
            value: bestDiscount.rules.map((r) => r.value),
          },
        ]
      : [],
    showMRP: true,
    showDiscountBadge: discountPercentage > 0,
    formatted: {
      mrp: `₹${originalPrice.toLocaleString("en-IN")}`,
      sellingPrice: `₹${discountedPrice.toLocaleString("en-IN")}`,
      savings: `₹${bestDiscountAmount.toLocaleString("en-IN")}`,
      discountLabel: discountPercentage ? `${discountPercentage}% off` : null,
    },
  };
}
