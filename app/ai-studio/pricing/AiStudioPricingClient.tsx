'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard } from 'lucide-react';
import type { AiStudioPlanConfig } from '@/lib/ai-studio/plans';

interface AiStudioPricingClientProps {
  plans: AiStudioPlanConfig[];
}

type CheckoutState =
  | { status: 'idle'; message: '' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      on: (eventName: string, handler: (response: unknown) => void) => void;
      open: () => void;
    };
  }
}

function formatPlanPrice(plan: AiStudioPlanConfig) {
  const majorAmount = plan.grossAmountMinor / 100;

  if (plan.currency === 'INR') {
    return `₹${majorAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  return `$${majorAmount.toFixed(2)}`;
}

function formatAiUsageValue(plan: AiStudioPlanConfig) {
  const majorAmount = plan.aiUsageValueMinor / 100;

  if (plan.currency === 'INR') {
    return `Includes ₹${majorAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} worth of AI usage`;
  }

  return `Includes $${majorAmount.toFixed(2)} worth of AI usage`;
}

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-js') as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay Checkout')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
    document.body.appendChild(script);
  });
}

export function AiStudioPricingClient({ plans }: AiStudioPricingClientProps) {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle', message: '' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeStatus = params.get('stripe');

    if (stripeStatus === 'success') {
      setCheckoutState({
        status: 'success',
        message: 'Payment received. AI Credits will appear in your wallet after Stripe confirms the payment.',
      });
      router.refresh();
    }

    if (stripeStatus === 'cancelled') {
      setCheckoutState({
        status: 'error',
        message: 'Stripe Checkout was cancelled. No payment was taken.',
      });
    }
  }, [router]);

  async function handleBuyPlan(plan: AiStudioPlanConfig) {
    if (plan.provider === 'razorpay' && plan.currency === 'INR') {
      await handleRazorpayPlan(plan);
      return;
    }

    if (plan.provider === 'stripe' && plan.currency === 'USD') {
      await handleStripePlan(plan);
    }
  }

  async function handleRazorpayPlan(plan: AiStudioPlanConfig) {
    setLoadingPlanId(plan.id);
    setCheckoutState({ status: 'idle', message: '' });

    try {
      const orderResponse = await fetch('/api/ai-studio/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      const orderData = (await orderResponse.json().catch(() => ({}))) as {
        error?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        user?: {
          email?: string | null;
          name?: string | null;
        };
      };

      if (!orderResponse.ok || !orderData.orderId || !orderData.keyId) {
        throw new Error(orderData.error || 'Unable to start payment');
      }

      await loadRazorpayScript();

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout is unavailable');
      }

      const checkout = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SimplifyConvert AI Studio',
        description: `${plan.name} credits`,
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
        },
        theme: {
          color: '#0891b2',
        },
        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
            setCheckoutState({
              status: 'error',
              message: 'Payment cancelled. You can try again anytime.',
            });
          },
        },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyResponse = await fetch('/api/ai-studio/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            const verifyData = (await verifyResponse.json().catch(() => ({}))) as {
              error?: string;
              creditsGranted?: number;
            };

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            setCheckoutState({
              status: 'success',
              message: `${(verifyData.creditsGranted || plan.creditsGranted).toLocaleString()} AI Credits added to your wallet.`,
            });
            router.refresh();
          } catch (error) {
            setCheckoutState({
              status: 'error',
              message: error instanceof Error ? error.message : 'Payment verification failed',
            });
          } finally {
            setLoadingPlanId(null);
          }
        },
      });

      checkout.on('payment.failed', () => {
        setLoadingPlanId(null);
        setCheckoutState({
          status: 'error',
          message: 'Payment cancelled. You can try again anytime.',
        });
      });

      checkout.open();
    } catch (error) {
      setCheckoutState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to start payment',
      });
      setLoadingPlanId(null);
    }
  }

  async function handleStripePlan(plan: AiStudioPlanConfig) {
    setLoadingPlanId(plan.id);
    setCheckoutState({ status: 'idle', message: '' });

    try {
      const checkoutResponse = await fetch('/api/ai-studio/payments/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      const checkoutData = (await checkoutResponse.json().catch(() => ({}))) as {
        error?: string;
        url?: string | null;
      };

      if (!checkoutResponse.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || 'Unable to start Stripe Checkout');
      }

      window.location.assign(checkoutData.url);
    } catch (error) {
      setCheckoutState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to start Stripe Checkout',
      });
      setLoadingPlanId(null);
    }
  }

  return (
    <>
      {checkoutState.status !== 'idle' && (
        <div
          className={`mb-5 rounded-lg border p-4 text-sm font-semibold ${
            checkoutState.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {checkoutState.message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => {
          const isRazorpayPlan = plan.provider === 'razorpay' && plan.currency === 'INR';
          const isStripePlan = plan.provider === 'stripe' && plan.currency === 'USD';
          const canBuyPlan = isRazorpayPlan || isStripePlan;
          const isLoading = loadingPlanId === plan.id;

          return (
            <article key={plan.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">
                    {plan.region === 'india' ? 'India' : 'Global'}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {plan.name.replace('India ', '').replace('Global ', '')}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                  <CreditCard size={22} />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-950">{formatPlanPrice(plan)}</span>
                <span className="pb-2 text-sm font-semibold text-slate-500">one-time purchase</span>
              </div>

              <div className="mt-6 rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-2xl font-bold text-cyan-950">{plan.creditsGranted.toLocaleString()} AI Credits</p>
                <p className="mt-1 text-sm leading-6 text-cyan-900">{formatAiUsageValue(plan)}</p>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payment</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {isRazorpayPlan ? 'Razorpay - INR' : isStripePlan ? 'Stripe - USD' : 'Coming soon'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Use for</p>
                  <p className="mt-1 font-semibold text-slate-950">AI Studio premium tools</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-700">
                {[
                  'AI-powered content planning',
                  'Smart visual layouts',
                  'PPTX export',
                  'Professional themes',
                  'Images and visual storytelling',
                ].map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle size={17} className="mt-0.5 shrink-0 text-cyan-700" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleBuyPlan(plan)}
                disabled={!canBuyPlan || Boolean(loadingPlanId)}
                className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-lg transition ${
                  canBuyPlan
                    ? 'bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500 shadow-none'
                }`}
              >
                {isLoading
                  ? 'Opening checkout...'
                  : isRazorpayPlan
                    ? 'Buy with Razorpay'
                    : isStripePlan
                      ? 'Buy with Stripe'
                      : 'Payment coming next'}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
