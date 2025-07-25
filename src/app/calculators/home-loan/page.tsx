"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { EnhancedCalculatorForm, EnhancedCalculatorField, CalculatorResult } from '@/components/ui/enhanced-calculator-form';
import { CalculatorLayout } from '@/components/layout/calculator-layout';
import { AdsPlaceholder } from "@/components/ui/ads-placeholder";
import { useCurrency } from "@/contexts/currency-context";
import { calculateLoan } from '@/lib/calculations/loan';

const initialValues = {
  principal: 3000000,
  rate: 8.5,
  years: 20,
  extraPayment: 0
};

interface HomeLoanInputs {
  principal: number;
  rate: number;
  years: number;
  extraPayment: number;
}

export default function HomeLoanCalculatorPage() {
  const [values, setValues] = useState<HomeLoanInputs>(initialValues);
  const [loading, setLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | undefined>(undefined);

  const { currency } = useCurrency();

  const homeLoanResults = useMemo(() => {
    setCalculationError(undefined);
    try {
      // Use flexible validation with graceful handling
      const validatedValues = {
        principal: Math.abs(values.principal || 0),
        rate: Math.abs(values.rate || 0),
        years: Math.max(values.years || 1, 1),
        extraPayment: Math.abs(values.extraPayment || 0)
      };

      const calculation = calculateLoan(validatedValues);

      return calculation;
    } catch (err: any) {
      console.error('Home loan calculation error:', err);
      setCalculationError(err.message || 'Calculation failed. Please verify your inputs and try again.');
      return null;
    }
  }, [values]);

  const fields: EnhancedCalculatorField[] = [
    {
      label: 'Home Loan Amount',
      name: 'principal',
      type: 'number',
      placeholder: '30,00,000',
      unit: currency.symbol,
      tooltip: 'Total amount you need to borrow for your home'
    },
    {
      label: 'Interest Rate',
      name: 'rate',
      type: 'percentage',
      placeholder: '8.5',
      step: 0.01,
      tooltip: 'Annual interest rate offered by the bank'
    },
    {
      label: 'Loan Tenure',
      name: 'years',
      type: 'number',
      placeholder: '20',
      unit: 'years',
      tooltip: 'Number of years to repay the loan'
    },
    {
      label: 'Extra Monthly Payment',
      name: 'extraPayment',
      type: 'number',
      placeholder: '0',
      unit: currency.symbol,
      step: 0.01,
      tooltip: 'Additional amount you can pay monthly to reduce tenure'
    }
  ];

  const results: CalculatorResult[] = useMemo(() => {
    if (!homeLoanResults) return [];

    const calculatorResults: CalculatorResult[] = [
      {
        label: 'Monthly EMI',
        value: homeLoanResults.monthlyPayment,
        type: 'currency',
        highlight: true,
        tooltip: 'Monthly installment you need to pay'
      },
      {
        label: 'Total Payment',
        value: homeLoanResults.totalPayment,
        type: 'currency',
        tooltip: 'Total amount you will pay over the loan tenure'
      },
      {
        label: 'Total Interest',
        value: homeLoanResults.totalInterest,
        type: 'currency',
        tooltip: 'Total interest paid over the loan tenure'
      },
      {
        label: 'Interest as % of Principal',
        value: (homeLoanResults.totalInterest / values.principal) * 100,
        type: 'percentage',
        tooltip: 'Interest as percentage of loan amount'
      }
    ];

    // Add extra payment benefits if applicable
    if (values.extraPayment && values.extraPayment > 0) {
      const payoffTimeMonths = homeLoanResults.payoffTime;
      const yearsReduced = Math.max(0, (values.years * 12) - payoffTimeMonths);
      
      calculatorResults.push(
        {
          label: 'Interest Saved',
          value: homeLoanResults.interestSaved,
          type: 'currency',
          tooltip: 'Interest saved with extra payments'
        },
        {
          label: 'Time Reduced',
          value: Math.round(yearsReduced / 12),
          type: 'number',
          tooltip: 'Years reduced from original tenure'
        }
      );
    }

    return calculatorResults;
  }, [homeLoanResults, values.principal, values.years, values.extraPayment, currency.symbol]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setCalculationError(undefined);
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setCalculationError(undefined);
    setTimeout(() => setLoading(false), 500);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="card">
        <AdsPlaceholder position="sidebar" size="300x250" />
      </div>
      <div className="card">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Home Loan Tips</h3>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Consider a higher down payment to reduce EMI.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Explore tax benefits on principal and interest payments.</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-success-500 text-sm">✓</span>
            <p className="text-sm text-neutral-600">Compare fixed vs. floating interest rates.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout
      title="Home Loan EMI Calculator"
      description="Calculate your home loan EMI, total payment, and interest. Plan your home purchase with confidence."
      sidebar={sidebar}
    >
      <EnhancedCalculatorForm
        title="Home Loan Details"
        description="Enter your home loan details."
        fields={fields}
        values={values}
        onChange={handleChange}
        onCalculate={handleCalculate}
        results={homeLoanResults ? results : []}
        loading={loading}
        error={calculationError}
        showComparison={false}
      />
    </CalculatorLayout>
  );
}
