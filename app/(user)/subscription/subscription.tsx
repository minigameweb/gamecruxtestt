"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PricingSectionUpgrade from "@/components/pricing-upgrade"
import { plans } from "@/constants/constants"
import { CurrencyProvider } from "@/contexts/CurrencyProvider"

type Subscription = {
  id: string;
  createdAt: Date | null;
  userId: string;
  plan: string;
  amount: string | null; // Changed from number to string to match schema
  isActive: string; // Changed from boolean to string to match schema
  status?: string; // Added status field
  cancelledAt?: Date | null;
  nextPaymentDate?: Date | null;
  pendingCancellation?: string; // Added as string
  cancellationReason?: string | null; // Added cancellation reason
  billingCycle?: string | null; // Added billing cycle
}

export default function SubscriptionPage({initialSubscription}: {initialSubscription: Subscription}) {
  if (!initialSubscription) {
    return <div>No subscription found</div>;
  }

  const currentPlanIndex = plans.findIndex((plan) => plan.name.toLowerCase() === initialSubscription.plan.toLowerCase());

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not available';

    // Use consistent formatting to prevent hydration issues
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC' // Add timezone to ensure consistency
    });
  };

  const isActive = initialSubscription.isActive === "true"; // Convert string to boolean
  const isPendingCancellation = initialSubscription.pendingCancellation === "true";

  return (
    <div className="mx-auto p-4 mt-12">
      <div className="flex flex-row items-center max-w-screen-xl mx-auto space-x-4 mb-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <strong>Plan Name:</strong> {initialSubscription.plan}
            </div>
            <div className="flex items-center gap-2">
              <strong>Amount:</strong> € {plans[currentPlanIndex]?.price.EUR.toFixed(2) || 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>{" "}
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              {isPendingCancellation && (
                <Badge variant="secondary">Pending Cancellation</Badge>
              )}
            </div>
            {initialSubscription.billingCycle && (
              <div className="flex items-center gap-2">
                <strong>Billing Cycle:</strong> {initialSubscription.billingCycle}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
            <CardDescription>Subscription information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <strong>Started:</strong> {formatDate(initialSubscription.createdAt)}
            </div>

            {initialSubscription.cancelledAt && (
              <div className="flex items-center gap-2">
                <strong>Cancelled:</strong> {formatDate(initialSubscription.cancelledAt)}
              </div>
            )}

            {initialSubscription.cancellationReason && (
              <div className="flex items-center gap-2">
                <strong>Cancellation Reason:</strong> {initialSubscription.cancellationReason}
              </div>
            )}

            <div className="flex items-center gap-2">
              <strong>Next Billing Date:</strong> {
                initialSubscription.cancelledAt
                  ? 'Cancelled'
                  : isPendingCancellation
                    ? 'Pending Cancellation'
                    : initialSubscription.nextPaymentDate
                      ? formatDate(initialSubscription.nextPaymentDate)
                      : 'Not scheduled'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {isPendingCancellation && (
        <div className="max-w-screen-xl mx-auto mb-8">
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="pt-6">
              <p className="text-orange-800 dark:text-orange-200">
                Your subscription is scheduled for cancellation at the end of your current billing period.
                You will continue to have access until {formatDate(initialSubscription.nextPaymentDate)}.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentPlanIndex === plans.length - 1 && (
        <p className="mt-4 text-center text-muted-foreground">
          You are currently on our highest tier plan. Thank you for your support!
        </p>
      )}
      <div>
          <CurrencyProvider>
            <PricingSectionUpgrade />
          </CurrencyProvider>
      </div>
    </div>
  );
}
