import { articleCategories } from '../../../src/utils/articleCategories';

describe('articleCategories', () => {
  it('should be an array', () => {
    expect(Array.isArray(articleCategories)).toBe(true);
  });

  it('should contain at least one category', () => {
    expect(articleCategories.length).toBeGreaterThan(0);
  });

  it('each category should be a string', () => {
    articleCategories.forEach(category => {
      expect(typeof category).toBe('string');
    });
  });

  it('should contain unique categories', () => {
    const uniqueCategories = new Set(articleCategories);
    expect(articleCategories.length).toBe(uniqueCategories.size);
  });
});