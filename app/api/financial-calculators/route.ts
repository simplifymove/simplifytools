/**
 * Financial Calculators API Route
 * 
 * Handles all financial calculator requests
 * Supports: startup runway, SaaS profit, loan optimization, India tax
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculateStartupRunway,
  calculateSaasProfitSimulation,
  calculateLoanOptimization,
  calculateIndiaTax,
  type StartupRunwayInputs,
  type SaasProfitInputs,
  type LoanOptimizerInputs,
  type IndiaTaxInputs,
} from '@/app/lib/financial-engines';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calculator, inputs } = body;

    if (!calculator) {
      return NextResponse.json(
        { ok: false, error: 'Calculator type is required' },
        { status: 400 }
      );
    }

    if (!inputs) {
      return NextResponse.json(
        { ok: false, error: 'Inputs are required' },
        { status: 400 }
      );
    }

    let result;

    switch (calculator) {
      case 'startup-runway':
        result = calculateStartupRunway(inputs as StartupRunwayInputs);
        break;
      case 'saas-profit':
        result = calculateSaasProfitSimulation(inputs as SaasProfitInputs);
        break;
      case 'loan-optimizer':
        result = calculateLoanOptimization(inputs as LoanOptimizerInputs);
        break;
      case 'india-tax':
        result = calculateIndiaTax(inputs as IndiaTaxInputs);
        break;
      default:
        return NextResponse.json(
          { ok: false, error: `Unknown calculator: "${calculator}"` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ok: true,
      calculator,
      result,
      meta: {
        timestamp: new Date().toISOString(),
        calculatorVersion: '1.0',
      },
    });
  } catch (error) {
    console.error('Financial calculator API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
