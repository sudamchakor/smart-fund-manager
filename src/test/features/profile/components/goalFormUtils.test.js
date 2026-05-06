import { calculateGoalProjection } from '../../../../features/profile/components/goalFormUtils.js'; // Corrected path

describe.skip('calculateGoalProjection', () => {
  it('should calculate goal projection correctly without inflation', () => {
    const goal = {
      targetAmount: 100000,
      targetYear: 2030,
      investmentPlans: [
        {
          type: 'sip',
          monthlyContribution: 500,
          expectedReturnRate: 0.1,
          timeHorizon: 10,
        },
        {
          type: 'lumpsum',
          monthlyContribution: 10000,
          expectedReturnRate: 0.08,
          timeHorizon: 5,
        },
      ],
    };
    const currentAge = 25;
    const considerInflation = false;
    const generalInflationRate = 0.05;

    const result = calculateGoalProjection(
      goal,
      currentAge,
      considerInflation,
      generalInflationRate,
    );

    expect(result).toBeDefined();
    expect(result.projectedValue).toBeCloseTo(100000); // Placeholder, actual calculation needed
    expect(result.requiredSip).toBeCloseTo(0); // Placeholder
  });

  it('should calculate goal projection correctly with inflation', () => {
    const goal = {
      targetAmount: 100000,
      targetYear: 2030,
      investmentPlans: [
        {
          type: 'sip',
          monthlyContribution: 500,
          expectedReturnRate: 0.1,
          timeHorizon: 10,
        },
      ],
    };
    const currentAge = 25;
    const considerInflation = true;
    const generalInflationRate = 0.05;

    const result = calculateGoalProjection(
      goal,
      currentAge,
      considerInflation,
      generalInflationRate,
    );

    expect(result).toBeDefined();
    // Add more specific assertions based on expected calculations
  });
});
