'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Sparkles } from 'lucide-react';
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
    return `\u20B9${majorAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }

  return `$${majorAmount.toFixed(2)}`;
}

function getPlanDescription(plan: AiStudioPlanConfig) {
  if (plan.name.toLowerCase().includes('pro')) {
    return 'Best for professionals and frequent AI content creation.';
  }

  return 'Ideal for individuals and occasional AI content creation.';
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
      existingScript.addEventListener('error', () => reject(new Error('Unable to load checkout')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load checkout'));
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
        message: 'Payment received. AI Credits will appear in your wallet after checkout is confirmed.',
      });
      router.refresh();
    }

    if (stripeStatus === 'cancelled') {
      setCheckoutState({
        status: 'error',
        message: 'Checkout was cancelled. No payment was taken.',
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
        throw new Error('Checkout is unavailable');
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
        throw new Error(checkoutData.error || 'Unable to start checkout');
      }

      window.location.assign(checkoutData.url);
    } catch (error) {
      setCheckoutState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to start checkout',
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

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isRazorpayPlan = plan.provider === 'razorpay' && plan.currency === 'INR';
          const isStripePlan = plan.provider === 'stripe' && plan.currency === 'USD';
          const canBuyPlan = isRazorpayPlan || isStripePlan;
          const isLoading = loadingPlanId === plan.id;
          const displayName = plan.name.replace('India ', '').replace('Global ', '');
          const isPro = displayName.toLowerCase().includes('pro');

          return (
            <article
              key={plan.id}
              className={`relative rounded-lg border bg-white p-8 shadow-xl shadow-slate-200/70 ${
                isPro ? 'border-cyan-300 ring-2 ring-cyan-100' : 'border-slate-200'
              }`}
            >
              {isPro && (
                <div className="absolute right-6 top-6 rounded-full bg-cyan-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Popular
                </div>
              )}

              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">{displayName}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">{getPlanDescription(plan)}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-800">
                  <Sparkles size={21} />
                </div>
              </div>

              <div>
                <span className="text-5xl font-bold tracking-tight text-slate-950">{formatPlanPrice(plan)}</span>
              </div>

              <div className="mt-7 rounded-lg border border-cyan-100 bg-cyan-50 px-5 py-4">
                <p className="text-2xl font-bold text-cyan-950">{plan.creditsGranted.toLocaleString()} AI Credits</p>
              </div>

              <ul className="mt-7 space-y-3.5 text-sm leading-6 text-slate-700">
                {[
                  'AI Presentation Maker',
                  'AI Document Maker',
                  'AI Spreadsheet Maker',
                  'PPTX, DOCX & XLSX Export',
                  'Professional AI Generation',
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
                className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-lg transition ${
                  canBuyPlan
                    ? 'bg-slate-950 text-white shadow-slate-950/20 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500 shadow-none'
                }`}
              >
                {isLoading
                  ? 'Opening checkout...'
                  : canBuyPlan
                    ? 'Buy Now'
                    : 'Unavailable'}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
