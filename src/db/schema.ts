import {
  pgTable,
  text,
  numeric,
  boolean,
  timestamp,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- SHARED COLUMNS (Don't repeat yourself) ---
// Every table gets these standard audit fields
const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// ==========================================
// 1. USERS (Prefix: usr_)
// ==========================================
export const users = pgTable("users", {
  // We use UUID for the database PK (fast, standard)
  id: uuid("id").defaultRandom().primaryKey(),

  // We use this for APIs/URLs (friendly, readable)
  // e.g., "usr_283492384"
  publicId: text("public_id").unique().notNull(),

  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  avatar: text("avatar"),

  // Store specialized app data as JSON to avoid 50 extra columns
  preferences: jsonb("preferences").$type<{
    currency?: string;
    language?: string;
    notifications?: boolean;
  }>(),

  ...timestamps,
});

// ==========================================
// 2. PACKAGES (Prefix: pkg_)
// ==========================================
export const packages = pgTable("packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").unique().notNull(), // e.g. "pkg_bali_escape"

  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),

  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),

  // Metadata
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).default("0"),

  // Media
  mainImage: text("main_image"),
  images: jsonb("images").$type<string[]>(),

  // Data
  itinerary: jsonb("itinerary"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),

  ...timestamps,
});

// ==========================================
// 3. BOOKINGS (Prefix: bk_)
// ==========================================
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Business ID: e.g. "BK-2025-001" (Generated via logic, not random)
  bookingRef: text("booking_ref").unique().notNull(),

  // Foreign Keys (Pointing to UUIDs)
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  packageId: uuid("package_id")
    .references(() => packages.id)
    .notNull(),

  status: text("status", {
    enum: ["pending", "confirmed", "cancelled", "completed"],
  }).default("pending"),

  totalPrice: numeric("total_price").notNull(),
  travelDate: timestamp("travel_date").notNull(),
  travelers: jsonb("travelers").$type<any[]>(),

  ...timestamps,
});

// ==========================================
// 4. TRANSACTIONS / PAYMENTS (Prefix: txn_)
// ==========================================
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: text("public_id").unique().notNull(), // e.g., "txn_razorpay_123"

  bookingId: uuid("booking_id")
    .references(() => bookings.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  amount: numeric("amount").notNull(),
  currency: text("currency").default("USD"),

  provider: text("provider").notNull(), // 'stripe', 'razorpay', 'cash'
  providerTransactionId: text("provider_txn_id"), // The ID from Stripe/Razorpay

  status: text("status", {
    enum: ["initiated", "success", "failed", "refunded"],
  }).default("initiated"),

  metadata: jsonb("metadata"), // Any extra gateway data

  ...timestamps,
});

// --- RELATIONS (For Drizzle Queries) ---
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  package: one(packages, {
    fields: [bookings.packageId],
    references: [packages.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));
