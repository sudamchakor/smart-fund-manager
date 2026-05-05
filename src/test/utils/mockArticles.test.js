import mockArticles from '../../../src/utils/mockArticles';

describe.skip('mockArticles', () => {
  it('should be an array', () => {
    expect(Array.isArray(mockArticles)).toBe(true);
  });

  it('should contain at least one article', () => {
    expect(mockArticles.length).toBeGreaterThan(0);
  });

  it('each article should have expected properties', () => {
    mockArticles.forEach((article) => {
      expect(article).toHaveProperty('id');
      expect(typeof article.id).toBe('string');
      expect(article).toHaveProperty('title');
      expect(typeof article.title).toBe('string');
      expect(article).toHaveProperty('description');
      expect(typeof article.description).toBe('string');
      expect(article).toHaveProperty('content');
      expect(typeof article.content).toBe('string');
      expect(article).toHaveProperty('imageUrl');
      expect(typeof article.imageUrl).toBe('string');
      expect(article).toHaveProperty('category');
      expect(typeof article.category).toBe('string');
      expect(article).toHaveProperty('author');
      expect(typeof article.author).toBe('string');
      expect(article).toHaveProperty('date');
      expect(typeof article.date).toBe('string'); // Assuming date is stored as a string
      expect(article).toHaveProperty('tags');
      expect(Array.isArray(article.tags)).toBe(true);
      expect(article.tags.every((tag) => typeof tag === 'string')).toBe(true);
    });
  });

  it('should have unique article IDs', () => {
    const ids = mockArticles.map((article) => article.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
