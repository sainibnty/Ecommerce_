import Category from "../models/Category.js";

// Recursively get all parent IDs for a category
export const getCategoryAncestors = async (categoryId) => {
  const ancestors = [];
  let current = await Category.findById(categoryId).select("parent");
  while (current && current.parent) {
    ancestors.push(current.parent);
    current = await Category.findById(current.parent).select("parent");
  }
  return ancestors; // returns array of parent category IDs
};
