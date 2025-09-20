import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    image: {
      public_id: String,
      url: String,
      alt: String,
    },
    icon: String,
    level: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// INSTANCE METHODS
// Generate unique slug
categorySchema.methods.generateSlug = async function () {
  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// STATIC METHODS
// Create category with auto-generated slug
categorySchema.statics.createCategory = async function (categoryData) {
  const category = new this(categoryData);
  category.slug = await category.generateSlug();

  // Update parent's children array if has parent
  // Calculate level
  if (category.parent) {
    const parentCategory = await this.findById(category.parent);
    category.level = parentCategory ? parentCategory.level + 1 : 0;
  } else {
    category.level = 0;
  }
  await category.save();

  return category;
};

// PRE MIDDLEWARE
// Auto-generate slug before saving
categorySchema.pre("save", async function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = await this.generateSlug();
  }
  next();
});

// Update parent's children array
categorySchema.pre("save", async function (next) {
  if (this.isModified("parent") && this.parent) {
    await this.constructor.findByIdAndUpdate(this.parent, {
      $addToSet: { children: this._id },
    });
  }
  next();
});

categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ level: 1, sortOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
