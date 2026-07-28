import assert from 'node:assert/strict';
import test from 'node:test';
import { AI_STUDIO_PLANS } from '../../lib/ai-studio/plans';
import {
  AI_STUDIO_PRICING_REGION_COOKIE,
  getAiStudioRegionFromCountry,
  getAiStudioPlansForPricingRegion,
  getAiStudioPricingCurrency,
  getAiStudioPricingRegionForCurrency,
  resolveAiStudioPricingRegion,
  serializeAiStudioPricingRegionCookie,
} from '../../lib/ai-studio/pricing-region';

test('initial India detection selects INR plans', () => {
  const region = resolveAiStudioPricingRegion(
    getAiStudioRegionFromCountry('IN'),
    null,
  );
  const plans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    region,
  );

  assert.equal(region, 'india');
  assert.equal(getAiStudioPricingCurrency(region), 'INR');
  assert.deepEqual(
    plans.map((plan) => plan.id),
    ['india-starter', 'india-pro'],
  );
});

test('initial non-India detection selects USD plans', () => {
  const region = resolveAiStudioPricingRegion(
    getAiStudioRegionFromCountry('US'),
    null,
  );
  const plans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    region,
  );

  assert.equal(region, 'global');
  assert.equal(getAiStudioPricingCurrency(region), 'USD');
  assert.deepEqual(
    plans.map((plan) => plan.id),
    ['global-starter', 'global-pro'],
  );
});

test('switching INR to USD selects global plans', () => {
  const region = getAiStudioPricingRegionForCurrency('USD');
  const plans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    region,
  );

  assert.equal(region, 'global');
  assert.ok(plans.every((plan) => plan.currency === 'USD'));
});

test('switching USD to INR selects India plans', () => {
  const region = getAiStudioPricingRegionForCurrency('INR');
  const plans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    region,
  );

  assert.equal(region, 'india');
  assert.ok(plans.every((plan) => plan.currency === 'INR'));
});

test('persisted selection overrides detected region', () => {
  assert.equal(resolveAiStudioPricingRegion('india', 'global'), 'global');
  assert.equal(resolveAiStudioPricingRegion('global', 'india'), 'india');
  assert.equal(resolveAiStudioPricingRegion('global', 'invalid'), 'global');

  const cookie = serializeAiStudioPricingRegionCookie('global', true);
  assert.match(
    cookie,
    new RegExp(`^${AI_STUDIO_PRICING_REGION_COOKIE}=global;`),
  );
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /; Secure$/);
});

test('payment provider mapping is unchanged', () => {
  const indiaPlans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    'india',
  );
  const globalPlans = getAiStudioPlansForPricingRegion(
    AI_STUDIO_PLANS,
    'global',
  );

  assert.ok(
    indiaPlans.every(
      (plan) => plan.currency === 'INR' && plan.provider === 'razorpay',
    ),
  );
  assert.ok(
    globalPlans.every(
      (plan) => plan.currency === 'USD' && plan.provider === 'paypal',
    ),
  );
});
