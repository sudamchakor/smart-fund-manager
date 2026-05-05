import * as emiCalculator from '../../../../../src/features/emiCalculator/utils/emiCalculator';

describe.skip('emiCalculator utils', () => {
  describe('calculateEMI', () => {
    it('should correctly calculate EMI for a given loan amount, interest rate, and tenure', () => {
      const loanAmount = 100000;
      const annualInterestRate = 10; // 10%
      const loanTenureMonths = 120; // 10 years

      const emi = emiCalculator.calculateEMI(
        loanAmount,
        annualInterestRate,
        loanTenureMonths,
      );
      expect(emi).toBeCloseTo(1321.51, 2); // Expected EMI for these values
    });

    it('should return 0 if loan amount is 0', () => {
      const emi = emiCalculator.calculateEMI(0, 10, 120);
      expect(emi).toBe(0);
    });

    it('should return loan amount / tenure if interest rate is 0', () => {
      const emi = emiCalculator.calculateEMI(120000, 0, 120);
      expect(emi).toBe(1000);
    });

    it('should handle edge case of 1 month tenure', () => {
      const emi = emiCalculator.calculateEMI(10000, 12, 1); // 1% monthly interest
      expect(emi).toBeCloseTo(10100, 2);
    });
  });

  describe('generatePaymentSchedule', () => {
    it('should generate a correct payment schedule', () => {
      const loanAmount = 100000;
      const annualInterestRate = 10;
      const loanTenureMonths = 12; // 1 year
      const emi = emiCalculator.calculateEMI(
        loanAmount,
        annualInterestRate,
        loanTenureMonths,
      );

      const schedule = emiCalculator.generatePaymentSchedule(
        loanAmount,
        annualInterestRate,
        loanTenureMonths,
        emi,
        [],
      );

      expect(schedule).toHaveLength(loanTenureMonths);

      // Check first payment
      expect(schedule[0].month).toBe(1);
      expect(schedule[0].principal).toBeCloseTo(7956.45, 2);
      expect(schedule[0].interest).toBeCloseTo(833.33, 2);
      expect(schedule[0].balance).toBeCloseTo(92043.55, 2);

      // Check last payment (balance should be close to 0)
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 2);
    });

    it('should handle prepayments correctly', () => {
      const loanAmount = 100000;
      const annualInterestRate = 10;
      const loanTenureMonths = 12;
      const emi = emiCalculator.calculateEMI(
        loanAmount,
        annualInterestRate,
        loanTenureMonths,
      );
      const prepayments = [{ month: 3, amount: 10000 }];

      const schedule = emiCalculator.generatePaymentSchedule(
        loanAmount,
        annualInterestRate,
        loanTenureMonths,
        emi,
        prepayments,
      );

      // After 3rd month prepayment, balance should be lower, and subsequent EMIs might adjust or tenure reduce
      expect(schedule.length).toBeLessThanOrEqual(loanTenureMonths); // Tenure should reduce
      expect(schedule[2].prepayment).toBe(10000);
      expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 2);
    });

    it('should return an empty array if loan amount is 0', () => {
      const schedule = emiCalculator.generatePaymentSchedule(0, 10, 120, 0, []);
      expect(schedule).toHaveLength(0);
    });
  });
});
