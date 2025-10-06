/**
 * Test assignment category field handling
 */

describe('Assignment Category Fields', () => {
  it('should handle grading_category field (GET response)', () => {
    const mockAssignment = {
      id: '123',
      title: 'Test Assignment',
      grading_category: '90423914', // STRING field from GET
    };

    const categoryId = mockAssignment.grading_category || (mockAssignment as any).grading_category_id;
    expect(categoryId).toBe('90423914');
  });

  it('should handle both field names for compatibility', () => {
    const assignment1 = { grading_category: '123' };
    const assignment2 = { grading_category_id: '456' };

    const getId = (a: any) => a.grading_category || a.grading_category_id;
    
    expect(getId(assignment1)).toBe('123');
    expect(getId(assignment2)).toBe('456');
  });

  it('should detect important assignments by category name', () => {
    const IMPORTANT_CATEGORIES = ['Test', 'Quiz', 'Exam', 'Assessment', 'Practical'];
    
    const isImportant = (text: string) => {
      return IMPORTANT_CATEGORIES.some(cat => text.toLowerCase().includes(cat.toLowerCase()));
    };

    expect(isImportant('Unit 1 Test')).toBe(true);
    expect(isImportant('Midterm Exam')).toBe(true);
    expect(isImportant('Pop Quiz')).toBe(true);
    expect(isImportant('Homework Assignment')).toBe(false);
  });

  it('should detect important assignments by both category AND title', () => {
    const checkImportant = (categoryName: string, title: string) => {
      const IMPORTANT = ['Test', 'Quiz', 'Exam'];
      const text = `${categoryName} ${title}`.toLowerCase();
      return IMPORTANT.some(cat => text.includes(cat.toLowerCase()));
    };

    expect(checkImportant('Uncategorized', 'Mid-term Practical Exam')).toBe(true);
    expect(checkImportant('Tests', 'Unit 1')).toBe(true);
    expect(checkImportant('Homework', 'Reading Assignment')).toBe(false);
  });
});

