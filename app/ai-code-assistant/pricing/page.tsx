/**
 * AI Code Assistant Pricing Page
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Zap, AlertCircle } from "lucide-react";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = (await res.json()) as {
        orderId: string;
        amount: number;
        keyId: string;
        currency: string;
      };

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as any).Razorpay;
        const razorpay = new RazorpayConstructor({
          key: data.keyId,
          order_id: data.orderId,
          amount: data.amount,
          currency: data.currency,
          name: "SimplifyConvert AI",
          description: "AI Code Assistant Monthly Subscription",
          handler: function (response: Record<string, string>) {
            console.log("Payment successful:", response);
            router.push("/dashboard/ai-code-assistant?success=true");
          },
          prefill: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
          },
          theme: {
            color: "#2563eb",
          },
        });
        razorpay.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/ai-code-assistant" className="text-blue-600 hover:text-blue-700">
            ← Back to AI Code Assistant
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600 mt-2">
            Choose a plan that fits your coding needs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {status === "unauthenticated" && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Sign in to get started</p>
                <p className="text-sm text-blue-800">
                  You need to be signed in to purchase a subscription.
                </p>
              </div>
            </div>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-semibold ml-4"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Starter Plan (Free) */}
          <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border border-gray-200">
            <div className="px-8 py-6">
              <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
              <p className="text-gray-600 mt-2">Perfect for trying it out</p>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-4xl font-bold text-gray-900">
                Free
              </p>
              <p className="text-gray-600 text-sm mt-2">Trial period</p>
            </div>
            <div className="px-8 py-8">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  10 credits to start
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Basic support
                </li>
                <li className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 flex-shrink-0" />
                  No auto-renewal
                </li>
                <li className="flex items-center gap-3 text-gray-500">
                  <div className="w-5 h-5 flex-shrink-0" />
                  Limited API usage
                </li>
              </ul>
              <button
                disabled
                className="w-full mt-8 bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                Currently Unavailable
              </button>
            </div>
          </div>

          {/* Monthly Plan (Popular) */}
          <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border-2 border-blue-600 relative">
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Popular
            </div>
            <div className="px-8 py-6">
              <h3 className="text-2xl font-bold text-gray-900">Monthly</h3>
              <p className="text-gray-600 mt-2">For active developers</p>
            </div>
            <div className="px-8 py-4 bg-blue-50 border-b border-blue-200">
              <p className="text-5xl font-bold text-gray-900">
                ₹499
              </p>
              <p className="text-gray-600 text-sm mt-2">/month, auto-renews</p>
            </div>
            <div className="px-8 py-8">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-semibold">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  100 monthly credits
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Unlimited requests
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  VS Code extension access
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Device authorization
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Auto-renews monthly
                </li>
              </ul>
              <button
                onClick={handleBuyNow}
                disabled={loading}
                className="w-full mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Get Started Now"}
              </button>
              <p className="text-xs text-gray-600 text-center mt-3">
                No commitment. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition border border-gray-200">
            <div className="px-8 py-6">
              <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
              <p className="text-gray-600 mt-2">Custom for your team</p>
            </div>
            <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-3xl font-bold text-gray-900">Custom</p>
              <p className="text-gray-600 text-sm mt-2">Contact sales</p>
            </div>
            <div className="px-8 py-8">
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Custom credit limits
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Team management
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  API rate limit increase
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  SLA guarantee
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Custom integrations
                </li>
              </ul>
              <a
                href="mailto:hello@simplifyconvert.com"
                className="w-full mt-8 bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition text-center block"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What are credits?",
                a: "Credits determine how much you can use the API based on code length. Smaller requests use 1 credit, medium requests use 3, and large requests use 5.",
              },
              {
                q: "Do credits expire?",
                a: "Yes, credits reset every month on your renewal date. Unused credits do not carry over to the next month.",
              },
              {
                q: "Can I change my plan?",
                a: "Currently, we offer one plan. Contact us if you need custom limits.",
              },
              {
                q: "How do I cancel?",
                a: "You can cancel anytime from your dashboard. Your subscription will end at the end of the current billing period.",
              },
              {
                q: "Is there a free trial?",
                a: "The Starter plan is not currently available. The monthly subscription is the available option for accessing AI Code Assistant features.",
              },
              {
                q: "What if I run out of credits?",
                a: "You can request more credits or wait for your monthly refresh. We'll send you reminders as you approach your limit.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
