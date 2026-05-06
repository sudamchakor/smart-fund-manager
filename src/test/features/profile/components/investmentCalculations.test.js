import {
  calculateSipFutureValue,
  calculateLumpsumFutureValue,
} from '../../../../features/profile/components/investmentCalculations.js'; // Corrected path

describe.skip('investmentCalculations', () => {
  it('calculateSipFutureValue should correctly calculate future value of SIP', () => {
    const monthlyInvestment = 1000;
    const annualReturnRate = 0.12; // 12% annual return
    const years = 10;
    const expectedFutureValue = 230038.69; // Calculated using an online SIP calculator

    const result = calculateSipFutureValue(
      monthlyInvestment,
      annualReturnRate,
      years,
    );
    expect(result).toBeCloseTo(expectedFutureValue, 0); // Allow for small floating point differences
  });

  it('calculateLumpsumFutureValue should correctly calculate future value of Lumpsum', () => {
    const initialInvestment = 100000;
    const annualReturnRate = 0.1; // 10% annual return
    const years = 5;
    const expectedFutureValue = 161051; // 100000 * (1 + 0.10)^5

    const result = calculateLumpsumFutureValue(
      initialInvestment,
      annualReturnRate,
      years,
    );
    expect(result).toBeCloseTo(expectedFutureValue, 0);
  });

  it('calculateSipFutureValue should return 0 for 0 monthly investment', () => {
    const result = calculateSipFutureValue(0, 0.12, 10);
    expect(result).toBe(0);
  });

  it('calculateLumpsumFutureValue should return 0 for 0 initial investment', () => {
    const result = calculateLumpsumFutureValue(0, 0.1, 5);
    expect(result).toBe(0);
  });

  it('calculateSipFutureValue should handle zero return rate', () => {
    const monthlyInvestment = 1000;
    const annualReturnRate = 0;
    const years = 10;
    const expectedFutureValue = 1000 * 12 * 10; // Simple sum
    const result = calculateSipFutureValue(
      monthlyInvestment,
      annualReturnRate,
      years,
    );
    expect(result).toBeCloseTo(expectedFutureValue);
  });

  it('calculateLumpsumFutureValue should handle zero return rate', () => {
    const initialInvestment = 100000;
    const annualReturnRate = 0;
    const years = 5;
    const expectedFutureValue = 100000;
    const result = calculateLumpsumFutureValue(
      initialInvestment,
      annualReturnRate,
      years,
    );
    expect(result).toBeCloseTo(expectedFutureValue);
  });
});
