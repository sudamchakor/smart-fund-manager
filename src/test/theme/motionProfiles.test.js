import * as motionProfiles from '../../../src/theme/motionProfiles';

describe.skip('Motion Profiles', () => {
  it('fadeIn should return correct animation properties', () => {
    const direction = 'up';
    const type = 'tween';
    const delay = 0.5;
    const duration = 1;
    const result = motionProfiles.fadeIn(direction, type, delay, duration);

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.hidden).toHaveProperty('y');
    expect(result.hidden.y).toBe(direction === 'up' ? 100 : direction === 'down' ? -100 : 0);
    expect(result.show.transition.type).toBe(type);
    expect(result.show.transition.delay).toBe(delay);
    expect(result.show.transition.duration).toBe(duration);
  });

  it('slideIn should return correct animation properties', () => {
    const direction = 'left';
    const type = 'tween';
    const delay = 0.3;
    const duration = 0.8;
    const result = motionProfiles.slideIn(direction, type, delay, duration);

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.hidden).toHaveProperty('x');
    expect(result.hidden.x).toBe(direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0);
    expect(result.show.transition.type).toBe(type);
    expect(result.show.transition.delay).toBe(delay);
    expect(result.show.transition.duration).toBe(duration);
  });

  it('staggerContainer should return correct animation properties', () => {
    const staggerChildren = 0.1;
    const delayChildren = 0.2;
    const result = motionProfiles.staggerContainer(staggerChildren, delayChildren);

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.show.transition.staggerChildren).toBe(staggerChildren);
    expect(result.show.transition.delayChildren).toBe(delayChildren);
  });

  it('textVariant should return correct animation properties', () => {
    const delay = 0.1;
    const result = motionProfiles.textVariant(delay);

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.show.transition.delay).toBe(delay);
  });

  it('textVariant2 should return correct animation properties', () => {
    const result = motionProfiles.textVariant2();

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.show.transition.staggerChildren).toBe(0.02);
    expect(result.show.transition.delayChildren).toBe(0.02);
  });

  it('zoomIn should return correct animation properties', () => {
    const delay = 0.4;
    const duration = 0.6;
    const result = motionProfiles.zoomIn(delay, duration);

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.show.transition.delay).toBe(delay);
    expect(result.show.transition.duration).toBe(duration);
  });

  it('footerVariants should return correct animation properties', () => {
    const result = motionProfiles.footerVariants();

    expect(result).toHaveProperty('hidden');
    expect(result).toHaveProperty('show');
    expect(result.show.transition.type).toBe('spring');
    expect(result.show.transition.duration).toBe(1.2);
    expect(result.show.transition.delay).toBe(0.5);
  });
});