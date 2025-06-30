"use server";

import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { subscriptions } from "@/db/schema"
import { lte } from "drizzle-orm"


export async function checkUsername(username: string): Promise<boolean> {
  if (username.length < 3) {
    return false;
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return !existingUser;
}

export async function checkProvider(email: string): Promise<'google' | 'discord' | 'credentials' | null> {
  // Check if user exists with this email
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return null;
  }

  // Only return if provider is one of the allowed values
  if (existingUser.provider === 'google' ||
      existingUser.provider === 'discord' ||
      existingUser.provider === 'credentials') {
    return existingUser.provider;
  }

  return null;
}

export async function getUserSubscription(userId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.isActive, "true") // Updated to use text-based boolean
    )
  })

  return {
    success: !!subscription,
    subscription
  }
}

export async function updateSubscriptionStatus() {
  const currentDate = new Date()

  await db
    .update(subscriptions)
    .set({ isActive: "false" }) // Updated to use text-based boolean
    .where(lte(subscriptions.cancelledAt, currentDate))
}

export async function fetchSubscription(userId: string): Promise<{ success: boolean, subscription: typeof subscriptions.$inferSelect | null }> {
  try {
    // Query the database for the user's subscription - get the most recent active one
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.createdAt)
      .limit(1);

    // If a subscription exists, return it with success true
    if (subscription.length > 0) {
      return {
        success: true,
        subscription: subscription[0]
      };
    }

    // If no subscription exists, return null with success false
    return {
      success: false,
      subscription: null
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw new Error("Failed to fetch subscription");
  }
}
