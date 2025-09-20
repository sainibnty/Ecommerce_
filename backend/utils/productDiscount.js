import Discount from "../models/Discount.js";
import { getCategoryAncestors } from "./categoryUtils.js";

// export async function applyDiscountsToProduct(product) {
//   const discounts = await getApplicableDiscounts(product);
//   let totalDiscount = 0;

//   for (const discount of discounts) {
//     const discountAmount = discount.calculateDiscount(
//       [{ product, quantity: 1, price: product.price }],
//       product.price
//     );
//     if (discountAmount > 0) totalDiscount += discountAmount;
//   }

//   const discountedPrice = Math.max(0, product.price - totalDiscount);

//   // Discount percentage vs product price
//   const discountPercentage =
//     totalDiscount > 0 ? Math.round((totalDiscount / product.price) * 100) : 0;

//   // Overall discount vs comparePrice (MRP)
//   const overallDiscountPercentage = product.comparePrice
//     ? Math.round(
//         ((product.comparePrice - discountedPrice) / product.comparePrice) * 100
//       )
//     : discountPercentage;

//   return {
//     id: product._id,
//     name: product.name,
//     slug: product.seo?.slug,
//     originalPrice: product.price,
//     discountedPrice,
//     discountPercentage,
//     overallDiscountPercentage,
//     comparePrice: product.comparePrice || null,
//     savings: product.price - discountedPrice,
//     mainImage: product.images?.find((img) => img.isMain) || product.images?.[0],
//     ratings: product.ratings,
//     brand: product.brand,
//     category: product.category,
//     inStock: product.inStock,
//     isFeatured: product.isFeatured,
//     hasDiscount: totalDiscount > 0,
//     appliedDiscounts: discounts.map((d) => ({
//       id: d._id,
//       name: d.name,
//       type: d.type,
//       value: d.value,
//     })),
//   };
// }
// Helper: Get applicable discounts for product
// const getApplicableDiscounts = async (product) => {
//   const now = new Date();

//   return await Discount.find({
//     isActive: true,
//     isAutomatic: true,
//     startDate: { $lte: now },
//     endDate: { $gte: now },
//     $or: [
//       { applicableProducts: product._id },
//       { applicableCategories: product.category._id || product.category },
//       {
//         applicableProducts: { $size: 0 },
//         applicableCategories: { $size: 0 },
//       },
//     ],
//   });
// };

/////////////////////////////////////////// WORKING /////////////////////////////////////////
// export const getApplicableDiscounts = async (product) => {
//   const now = new Date();
//   const productId = product._id;
//   const categoryId = product.category._id || product.category;

//   // get all parent categories
//   const parentCategories = await getCategoryAncestors(categoryId);
//   return await Discount.find({
//     isActive: true,
//     isAutomatic: true,
//     startDate: { $lte: now },
//     endDate: { $gte: now },
//     $or: [
//       { applicableProducts: productId },
//       { applicableCategories: categoryId },
//       { applicableCategories: { $in: parentCategories } },
//       { applicableProducts: { $size: 0 } },
//       { applicableCategories: { $size: 0 } },
//     ],
//   }).sort({ priority: -1 });
// };
//////////////////////////////////////////          /////////////////////////////////////////

export const getApplicableDiscounts = async (product) => {
  const now = new Date();
  const productId = product._id;
  const categoryId = product.category._id || product.category;

  // fetch all parent categories (for hierarchical match)
  const parentCategories = await getCategoryAncestors(categoryId);

  // base query
  const query = {
    isActive: true,
    isAutomatic: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  // flexible condition building
  const conditions = [];

  // product-specific
  conditions.push({ applicableProducts: productId });

  // category-specific (direct + parent categories)
  conditions.push({ applicableCategories: categoryId });
  if (parentCategories.length > 0) {
    conditions.push({ applicableCategories: { $in: parentCategories } });
  }

  // global case → only if arrays are empty in schema
  conditions.push({
    $and: [
      { applicableProducts: { $size: 0 } },
      { applicableCategories: { $size: 0 } },
    ],
  });

  query.$or = conditions;

  return await Discount.find(query).sort({ priority: -1 });
};

// export const applyDiscountsToProduct = async (product) => {
//   const discounts = await getApplicableDiscounts(product);
//   let totalDiscount = 0;
//   let appliedDiscounts = [];
//   const mrp =
//     product.comparePrice && product.comparePrice > 0
//       ? Number(product.comparePrice)
//       : Number(product.price || 0);

//   // Simulate single product in cart
//   const cartItem = [{ product, quantity: 1, price: product.price }];

//   for (const discount of discounts) {
//     // totalDiscount += discount.calculateDiscount(cartItem, product.price);
//     const discountValue = discount.calculateDiscount(cartItem, product.price);
//     if (discountValue > 0) {
//       totalDiscount += discountValue;
//       appliedDiscounts.push({
//         id: discount._id,
//         name: discount.name,
//         type: discount.rules.map((r) => r.type),
//         value: discount.rules.map((r) => r.value),
//       });
//     }
//     if (!discount.canCombineWithOtherDiscounts) {
//       break;
//     }
//   }
//   const discountedPrice = Math.max(0, product.price - totalDiscount);
//   const discounted = Math.max(0, Number(discountedPrice || 0));
//   // savings should be based on the chosen MRP
//   const savings = Math.max(0, mrp - discounted);
//   const discountPercentage =
//     totalDiscount > 0 ? Math.round((totalDiscount / product.price) * 100) : 0;

//   const overallDiscountPercentage = product.comparePrice
//     ? Math.round(
//         ((product.comparePrice - discountedPrice) / product.comparePrice) * 100
//       )
//     : discountPercentage;
//   const hasDiscount = savings > 0;
//   return {
//     originalPrice: mrp,
//     discountedPrice: discounted,
//     overallDiscountPercentage,
//     savings,
//     hasDiscount,
//     appliedDiscounts,
//     showMRP: mrp > discounted,
//     showDiscountBadge: discountPercentage > 0,
//     formatted: {
//       mrp: mrp ? `₹${mrp.toLocaleString("en-IN")}` : null,
//       sellingPrice: `₹${discounted.toLocaleString("en-IN")}`,
//       savings: `₹${savings.toLocaleString("en-IN")}`,
//       discountLabel: overallDiscountPercentage
//         ? `${overallDiscountPercentage}% off`
//         : null,
//     },
//   };
// };

export const applyDiscountsToProduct = async (product) => {
  const discounts = await getApplicableDiscounts(product);
  let totalDiscount = 0;
  let appliedDiscounts = [];
  const mrp =
    product.comparePrice && product.comparePrice > 0
      ? Number(product.comparePrice)
      : Number(product.price || 0);

  const cartItem = [{ product, quantity: 1, price: product.price }];

  const exclusiveDiscount = discounts.find(
    (d) =>
      !d.canCombineWithOtherDiscounts &&
      d.calculateDiscount(cartItem, product.price) > 0
  );

  if (exclusiveDiscount) {
    // Only apply the exclusive discount
    const value = exclusiveDiscount.calculateDiscount(cartItem, product.price);
    totalDiscount = value;
    appliedDiscounts.push({
      id: exclusiveDiscount._id,
      name: exclusiveDiscount.name,
      type: exclusiveDiscount.rules.map((r) => r.type),
      value: exclusiveDiscount.rules.map((r) => r.value),
    });
  } else {
    // Apply all combinable discounts
    for (const discount of discounts) {
      const value = discount.calculateDiscount(cartItem, product.price);
      if (value > 0) {
        totalDiscount += value;
        appliedDiscounts.push({
          id: discount._id,
          name: discount.name,
          type: discount.rules.map((r) => r.type),
          value: discount.rules.map((r) => r.value),
        });
      }
    }
  }

  const discountedPrice = Math.max(0, product.price - totalDiscount);
  const savings = product.price - discountedPrice;

  const discounted = Math.max(0, Number(discountedPrice || 0));

  const overallDiscountPercentage = product.comparePrice
    ? Math.round(
        ((product.comparePrice - discountedPrice) / product.comparePrice) * 100
      )
    : totalDiscount > 0
    ? Math.round((totalDiscount / product.price) * 100)
    : 0;
  const hasDiscount = savings > 0;

  return {
    originalPrice: mrp,
    discountedPrice: discounted,
    overallDiscountPercentage,
    savings,
    hasDiscount,
    appliedDiscounts,
    showMRP: mrp > discounted,
    showDiscountBadge: totalDiscount > 0,
    formatted: {
      mrp: mrp ? `₹${mrp.toLocaleString("en-IN")}` : null,
      sellingPrice: `₹${discounted.toLocaleString("en-IN")}`,
      savings: `₹${savings.toLocaleString("en-IN")}`,
      discountLabel: overallDiscountPercentage
        ? `${overallDiscountPercentage}% off`
        : null,
    },
  };
};
