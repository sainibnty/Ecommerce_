import Discount from "../models/Discount.js";

export async function applyDiscounts(cart, userId, couponCode = null) {
  const now = new Date();

  let query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  if (couponCode) {
    query.code = couponCode; 
  } else {
    query.isAutomatic = true; 
  }

  const discounts = await Discount.find(query);

  let cartTotal = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  let totalDiscount = 0;
  let appliedDiscounts = [];

  for (const discount of discounts) {
    if (!discount.canUserUse(userId, cart.isFirstTimeCustomer)) continue;

    const amount = discount.calculateDiscount(cart.items, cartTotal);
    if (amount > 0) {
      totalDiscount += amount;
      appliedDiscounts.push({
        id: discount._id,
        name: discount.name,
        code: discount.code,
        amount,
      });
    }
  }

  return {
    originalTotal: cartTotal,
    discountedTotal: Math.max(0, cartTotal - totalDiscount),
    appliedDiscounts,
  };
}
