"use server"

import { auth } from '@/auth'
import { redirect } from "next/navigation"
import Subscription from './subscription'
import { fetchSubscription } from '@/lib/server-utils'


export default async function SubscriptionPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const subscription = session?.user?.id ? await fetchSubscription(session.user.id) : null;

  return subscription?.success === true ? (
    <Subscription initialSubscription={subscription.subscription} />
  ) : null
}
