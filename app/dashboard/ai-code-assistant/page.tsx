/**
 * Dashboard page for AI Code Assistant
 * Shows subscription status, API keys, credits, and device management
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Smartphone,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";

interface SubscriptionData {
  subscription?: {
    id: string;
    planName: string;
    status: string;
    monthlyCredits: number;
    creditsUsed: number;
    creditsRemaining: number;
    startsAt: string;
    expiresAt: string;
    daysRemaining: number;
  };
  apiKeys: Array<{
    id: string;
    keyPrefix: string;
    keyLast4: string;
    machineId?: string;
    isActive: boolean;
    createdAt: string;
    deactivatedAt?: string;
    masked: string;
  }>;
  creditsInfo?: {
    monthlyCredits: number;
    creditsUsed: number;
    creditsRemaining: number;
    percentUsed: number;
  };
}

export default function AiDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/user/ai-subscription");
        if (!res.ok) throw new Error("Failed to fetch subscription");
        const data = (await res.json()) as SubscriptionData;
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchSubscription();
    }
  }, [status]);

  const handleRegenerateKey = async () => {
    try {
      const res = await fetch("/api/user/api-key/regenerate", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to regenerate API key");

      const data = (await res.json()) as {
        apiKey: string;
        masked: string;
        message: string;
      };
      setNewApiKey(data.apiKey);
      setShowApiKey(true);

      // Refresh subscription data
      const subRes = await fetch("/api/user/ai-subscription");
      if (subRes.ok) {
        const subData = (await subRes.json()) as SubscriptionData;
        setSubscription(subData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleResetDevice = async (keyId: string) => {
    if (
      !confirm(
        "This will clear the device lock for this API key. You can use it on a new device."
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/user/device/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });

      if (!res.ok) throw new Error("Failed to reset device");

      // Refresh subscription data
      const subRes = await fetch("/api/user/ai-subscription");
      if (subRes.ok) {
        const subData = (await subRes.json()) as SubscriptionData;
        setSubscription(subData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AI Code Assistant</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and API keys</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!subscription?.subscription ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h2>
            <p className="text-gray-600 mb-6">
              You don't have an active subscription yet. Get started with our AI coding assistant.
            </p>
            <Link
              href="/ai-code-assistant/pricing"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Pricing
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Subscription Status
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.subscription.planName === "monthly"
                        ? "Monthly Plan"
                        : subscription.subscription.planName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold text-green-600">
                      {subscription.subscription.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Renewal Date</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(subscription.subscription.expiresAt).toLocaleDateString()} (
                      {subscription.subscription.daysRemaining} days)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credits This Month</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.creditsInfo?.creditsRemaining || 0} /{" "}
                      {subscription.subscription.monthlyCredits}
                    </p>
                  </div>
                </div>

                {/* Credits Progress */}
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Credit Usage
                  </p>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{
                        width: `${subscription.creditsInfo?.percentUsed || 0}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {subscription.creditsInfo?.creditsUsed || 0} /{" "}
                    {subscription.subscription.monthlyCredits} credits used
                  </p>
                </div>

                {subscription.subscription.daysRemaining &&
                  subscription.subscription.daysRemaining <= 3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                      ⚠️ Your subscription expires in {subscription.subscription.daysRemaining}{" "}
                      days.
                      <Link
                        href="/ai-code-assistant/pricing"
                        className="ml-2 font-semibold underline"
                      >
                        Renew now
                      </Link>
                    </div>
                  )}
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">API Keys</h2>
              </div>
              <div className="p-6 space-y-4">
                {newApiKey && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-green-900">
                      🎉 New API key generated!
                    </p>
                    <div className="bg-white border border-green-300 rounded p-3 font-mono text-sm flex items-center justify-between gap-2">
                      <span className={showApiKey ? "text-gray-900" : "text-gray-400"}>
                        {showApiKey ? newApiKey : "•".repeat(32)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(newApiKey)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-green-700">
                      Save this key now - it will never be shown again!
                    </p>
                  </div>
                )}

                {subscription.apiKeys && subscription.apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {subscription.apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-mono text-sm text-gray-900">{key.masked}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Created: {new Date(key.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              key.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {key.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        {key.machineId ? (
                          <div className="bg-gray-50 rounded p-3 flex items-start gap-2">
                            <Smartphone className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-900">Device Locked</p>
                              <p className="text-xs text-gray-600 break-all">{key.machineId}</p>
                              <button
                                onClick={() => handleResetDevice(key.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-semibold"
                              >
                                Reset Device Lock
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 italic">
                            Device lock will be set on first use
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No API keys yet</p>
                )}

                <button
                  onClick={handleRegenerateKey}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 mt-4"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New API Key
                </button>
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Get Started</h2>
              <div className="space-y-3">
                <Link
                  href="/ai-code-assistant/docs"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <p className="font-semibold text-gray-900">📚 Documentation</p>
                  <p className="text-sm text-gray-600">Learn how to use the API</p>
                </Link>
                <a
                  href="#"
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <p className="font-semibold text-gray-900">💻 VS Code Extension</p>
                  <p className="text-sm text-gray-600">Coming soon</p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
