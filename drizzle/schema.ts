import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  days: int("days").notNull(),
  budget: varchar("budget", { length: 32 }).notNull(),
  group: varchar("tripGroup", { length: 32 }).notNull(),
  travelers: int("travelers").default(1),
  interests: json("interests").$type<string[]>().notNull(),
  adultOnly: int("adultOnly").default(0).notNull(),
  itinerary: json("itinerary").$type<Record<string, unknown>>().notNull(),
  selectedOption: varchar("selectedOption", { length: 16 }).default("A"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;
