"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { plans, PricingTier } from "@/constants/constants";
import { useContext, useEffect, useState } from "react";
import { CurrencyContext } from "@/contexts/CurrencyProvider";
import { formatPrice } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import MaxWidthWrapper from "@/components/MaxWidth";
import { createTebexBasket } from "@/lib/tebex";
import Image from "next/image";
import { fetchPaymentDetailsServerSide } from "@/app/actions/tebexPaymentService";
import { processPayment } from "@/app/actions/paymentActions";
import { fetchSubscription } from "@/lib/server-utils";

export default function PricingSection() {
  const { currency } = useContext(CurrencyContext);
  const { data: session } = useSession();
  const router = useRouter();
  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);
  const [Tebex, setTebex] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dynamically import Tebex to prevent SSR issues
  useEffect(() => {
    import("@tebexio/tebex.js")
      .then((module) => setTebex(module.default))
      .catch((err) => console.error("Error loading Tebex:", err));
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserSubscription = async () => {
        try {
          if (!session.user.id) throw new Error("User ID is required");
          const result = await fetchSubscription(session.user.id);

          console.log("Fetched Subscription:", result);

          if (result?.subscription) {
            setSubscription({
              plan: result.subscription.plan,
            });
          } else {
            setSubscription(null);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleGetStarted = async (plan: PricingTier) => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }

    if (!plan.tebexId) {
      toast.error("Invalid plan configuration");
      return;
    }

    if (!Tebex) {
      toast.error("Payment system not loaded. Try again.");
      return;
    }

    try {
      setProcessingStates((prev) => ({ ...prev, [plan.name]: true }));

      const basketIdent = await createTebexBasket(
        [plan.tebexId.toString()],
        session.user?.name ?? "",
        session.user?.id ?? "",
        session.user?.discordId ?? "",
      );

      const config = {
        ident: basketIdent,
        theme: "dark",
        colors: [
          { name: "primary", color: "#FFD12E" },
          { name: "secondary", color: "#000000" },
        ],
        endpoint: "https://pay.tebex.io",
      };

      Tebex.checkout.init(config);

      Tebex.checkout.on("payment:complete", async (data) => {
        console.log("Payment complete data:", data);
        const transactionId = data.payment?.txnId;

        try {
          const paymentDetails = await fetchPaymentDetailsServerSide(transactionId);
          console.log("Payment details:", paymentDetails);

          // Call the Server Action to process the payment
          const result = await processPayment(paymentDetails);

            if (result.success) {
            toast.success("Payment completed successfully!");
            router.push('/games');
          } else {
            toast.error("Payment completed but failed to verify details");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast.error("Payment completed but failed to verify details");
        }
      });

      Tebex.checkout.on("payment:error", () => {
        toast.error("Payment failed. Please try again.");
      });

      Tebex.checkout.launch();
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setProcessingStates((prev) => ({ ...prev, [plan.name]: false }));
    }
  };

  return (
    <MaxWidthWrapper maxWidth="full">
      <div className="p-8 mx-auto space-y-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {plans.map((plan, index) => {
            const isPlanActive = subscription?.plan?.toLowerCase() === plan.name.toLowerCase()
            const isProcessing = processingStates[plan.name]

            return (
              <Card key={plan.name} className="bg-black border border-gray-800 relative flex flex-col h-full">
                <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  {plan.popular && <Badge className="bg-[#FFD12E] text-black font-medium">Most Popular</Badge>}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>
                </CardHeader>
                {plan.imageUrl && (
                <div className="px-6">
                  <Image
                  src={plan.imageUrl}
                  alt={plan.name}
                  width={1200}
                  height={1200}
                  className="w-full rounded-lg"
                  />
                </div>
                )}
                <CardContent className="space-y-6 flex-grow">
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-white">
                  {formatPrice(plan.price[currency], currency)}
                  </div>
                  <div className="text-sm text-gray-400">{plan.duration}</div>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 flex-shrink-0 text-[#FFD12E]" />
                    <span className="text-sm">{feature}</span>
                  </li>
                  ))}
                </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button
                    className="w-full bg-[#FFD12E] hover:bg-[#E5BC29] text-black font-semibold"
                    onClick={() => handleGetStarted(plan)}
                    disabled={isProcessing || isPlanActive || loading}
                  >
                    {loading ? (
                      "Loading..."
                    ) : isPlanActive ? (
                      "Current Plan"
                    ) : isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      </div>
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </MaxWidthWrapper>
  )
}