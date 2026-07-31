'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Sparkles } from 'lucide-react';
import type { AiStudioPlanConfig } from '@/lib/ai-studio/plans';
import { canStartAiStudioCheckout } from '@/lib/ai-studio/checkout-access';
import { getSignInPath } from '@/lib/auth/redirect';
import {
  getAiStudioPlansForPricingRegion,
  getAiStudioPricingCurrency,
  getAiStudioPricingRegionForCurrency,
  serializeAiStudioPricingRegionCookie,
  type AiStudioPricingCurrency,
  type AiStudioPricingRegion,
} from '@/lib/ai-studio/pricing-region';

interface AiStudioPricingClientProps {
  plans: AiStudioPlanConfig[];
  initialRegion: AiStudioPricingRegion;
  paypalClientId: string | null;
}

type CheckoutState =
  | { status: 'idle'; message: '' }
  | { status: 'success'; message: string }
  | { status: 'pending'; message: string }
  | { status: 'error'; message: string };

interface PayPalButtonsInstance {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
}

interface PayPalNamespace {
  Buttons: (options: Record<string, unknown>) => PayPalButtonsInstance;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      on: (eventName: string, handler: (response: unknown) => void) => void;
      open: () => void;
    };
    paypal?: PayPalNamespace;
  }
}

let paypalScriptPromise: Promise<PayPalNamespace> | null = null;

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

function loadPayPalScript(clientId: string) {
  if (window.paypal) {
    return Promise.resolve(window.paypal);
  }

  if (paypalScriptPromise) {
    return paypalScriptPromise;
  }

  paypalScriptPromise = new Promise<PayPalNamespace>((resolve, reject) => {
    const staleScript = document.getElementById(
      'paypal-checkout-js',
    ) as HTMLScriptElement | null;

    staleScript?.remove();

    const script = document.createElement('script');
    script.id = 'paypal-checkout-js';
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
        return;
      }

      script.remove();
      paypalScriptPromise = null;
      reject(new Error('PayPal checkout did not load'));
    };
    script.onerror = () => {
      script.remove();
      paypalScriptPromise = null;
      reject(new Error('Unable to load PayPal checkout'));
    };
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
}

function PayPalPlanButton({
  plan,
  clientId,
  disabled,
  checkoutLock,
  setLoadingPlanId,
  setCheckoutState,
}: {
  plan: AiStudioPlanConfig;
  clientId: string;
  disabled: boolean;
  checkoutLock: { current: string | null };
  setLoadingPlanId: (planId: string | null) => void;
  setCheckoutState: (state: CheckoutState) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let buttons: PayPalButtonsInstance | null = null;
    let handledError = false;

    loadPayPalScript(clientId)
      .then(async (paypal) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        buttons = paypal.Buttons({
          style: {
            layout: 'vertical',
            shape: 'rect',
            label: 'paypal',
            height: 48,
          },
          createOrder: async () => {
            if (cancelled) {
              throw new Error('PayPal checkout was closed');
            }

            if (checkoutLock.current) {
              handledError = true;
              setCheckoutState({
                status: 'error',
                message: 'Another PayPal checkout is already in progress.',
              });
              throw new Error('Another PayPal checkout is already in progress');
            }

            checkoutLock.current = plan.id;
            handledError = false;
            setLoadingPlanId(plan.id);
            setCheckoutState({ status: 'idle', message: '' });

            try {
              const response = await fetch(
                '/api/ai-studio/payments/paypal/create-order',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ planId: plan.id }),
                },
              );
              const data = (await response.json().catch(() => ({}))) as {
                error?: string;
                orderId?: string;
              };

              if (cancelled) {
                throw new Error('PayPal checkout was closed');
              }

              if (!response.ok || !data.orderId) {
                throw new Error(data.error || 'Unable to start PayPal checkout');
              }

              return data.orderId;
            } catch (error) {
              checkoutLock.current = null;
              handledError = true;

              if (!cancelled) {
                setLoadingPlanId(null);
                setCheckoutState({
                  status: 'error',
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Unable to start PayPal checkout',
                });
              }

              throw error;
            }
          },
          onApprove: async (data: { orderID?: string }) => {
            if (cancelled) {
              return;
            }

            try {
              if (!data.orderID) {
                throw new Error('PayPal did not return an order ID');
              }

              const response = await fetch(
                '/api/ai-studio/payments/paypal/capture',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: data.orderID }),
                },
              );
              const result = (await response.json().catch(() => ({}))) as {
                error?: string;
                pendingVerification?: boolean;
                creditsGranted?: number;
              };

              if (cancelled) {
                return;
              }

              if (!response.ok) {
                handledError = true;

                if (result.pendingVerification) {
                  setCheckoutState({
                    status: 'pending',
                    message:
                      'Your approval was received, but payment confirmation is still pending. Do not retry immediately.',
                  });
                  return;
                }

                throw new Error(
                  result.error || 'Unable to confirm PayPal payment',
                );
              }

              setCheckoutState({
                status: 'success',
                message: `${(result.creditsGranted || plan.creditsGranted).toLocaleString()} AI Credits added to your wallet.`,
              });
              router.refresh();
            } catch (error) {
              handledError = true;

              if (!cancelled) {
                setCheckoutState({
                  status: 'error',
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Unable to confirm PayPal payment',
                });
              }
            } finally {
              checkoutLock.current = null;

              if (!cancelled) {
                setLoadingPlanId(null);
              }
            }
          },
          onCancel: () => {
            if (cancelled) {
              return;
            }

            checkoutLock.current = null;
            setLoadingPlanId(null);
            setCheckoutState({
              status: 'error',
              message: 'PayPal checkout was cancelled. No capture was requested.',
            });
          },
          onError: () => {
            if (cancelled) {
              return;
            }

            checkoutLock.current = null;
            setLoadingPlanId(null);

            if (!handledError) {
              setCheckoutState({
                status: 'pending',
                message:
                  'PayPal checkout could not finish. If you approved the payment, confirmation may still be pending.',
              });
            }
          },
        });

        await buttons.render(containerRef.current);
      })
      .catch((error) => {
        if (!cancelled) {
          setCheckoutState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load PayPal checkout',
          });
        }
      });

    return () => {
      cancelled = true;

      if (checkoutLock.current === plan.id) {
        checkoutLock.current = null;
      }

      const closePromise = buttons?.close?.();

      if (closePromise) {
        void closePromise.catch(() => undefined);
      }
    };
  }, [
    checkoutLock,
    clientId,
    plan,
    router,
    setCheckoutState,
    setLoadingPlanId,
  ]);

  return (
    <div
      className={`mt-8 min-h-12 ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      aria-busy={disabled}
    >
      <div ref={containerRef} />
    </div>
  );
}

export function AiStudioPricingClient({
  plans,
  initialRegion,
  paypalClientId,
}: AiStudioPricingClientProps) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const paypalCheckoutLock = useRef<string | null>(null);
  const [selectedRegion, setSelectedRegion] =
    useState<AiStudioPricingRegion>(initialRegion);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ status: 'idle', message: '' });
  const selectedCurrency = getAiStudioPricingCurrency(selectedRegion);
  const canStartCheckout = canStartAiStudioCheckout(sessionStatus);
  const visiblePlans = getAiStudioPlansForPricingRegion(
    plans,
    selectedRegion,
  );
  const signInHref = getSignInPath('/ai-studio/pricing');

  function handleCurrencyChange(currency: AiStudioPricingCurrency) {
    if (loadingPlanId) {
      return;
    }

    const nextRegion = getAiStudioPricingRegionForCurrency(currency);

    if (nextRegion === selectedRegion) {
      return;
    }

    document.cookie = serializeAiStudioPricingRegionCookie(
      nextRegion,
      window.location.protocol === 'https:',
    );
    setSelectedRegion(nextRegion);
    setCheckoutState({ status: 'idle', message: '' });
  }

  async function handleBuyPlan(plan: AiStudioPlanConfig) {
    if (plan.provider === 'razorpay' && plan.currency === 'INR') {
      await handleRazorpayPlan(plan);
      return;
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

  return (
    <>
      <div className="mb-6 flex justify-center">
        <fieldset className="w-full max-w-sm">
          <legend className="mb-2 w-full text-center text-sm font-semibold text-slate-700">
            Choose your currency
          </legend>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {(['INR', 'USD'] as const).map((currency) => {
              const isSelected = selectedCurrency === currency;

              return (
                <button
                  key={currency}
                  type="button"
                  onClick={() => handleCurrencyChange(currency)}
                  disabled={Boolean(loadingPlanId)}
                  aria-pressed={isSelected}
                  className={`min-h-11 rounded-lg px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-transparent text-slate-700 hover:bg-white'
                  }`}
                >
                  {currency}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {checkoutState.status !== 'idle' && (
        <div
          role={checkoutState.status === 'error' ? 'alert' : 'status'}
          aria-live={checkoutState.status === 'error' ? 'assertive' : 'polite'}
          className={`mb-5 rounded-lg border p-4 text-sm font-semibold ${
            checkoutState.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : checkoutState.status === 'pending'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {checkoutState.message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {visiblePlans.map((plan) => {
          const isRazorpayPlan = plan.provider === 'razorpay' && plan.currency === 'INR';
          const isPayPalPlan = plan.provider === 'paypal' && plan.currency === 'USD';
          const canBuyPlan = isRazorpayPlan || (isPayPalPlan && Boolean(paypalClientId));
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

              {!canStartCheckout ? (
                sessionStatus === 'unauthenticated' ? (
                  <Link
                    href={signInHref}
                    className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2"
                  >
                    Sign in to buy credits
                  </Link>
                ) : (
                  <div
                    className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-600"
                    role="status"
                  >
                    Checking sign-in...
                  </div>
                )
              ) : isPayPalPlan && paypalClientId ? (
                <PayPalPlanButton
                  plan={plan}
                  clientId={paypalClientId}
                  disabled={Boolean(loadingPlanId) && !isLoading}
                  checkoutLock={paypalCheckoutLock}
                  setLoadingPlanId={setLoadingPlanId}
                  setCheckoutState={setCheckoutState}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleBuyPlan(plan)}
                  disabled={!canBuyPlan || Boolean(loadingPlanId)}
                  aria-busy={isLoading}
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
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
