describe('helloWorld function', () => {
  it('should return a 200 status code', async () => {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:5000/helloWorld');
    expect(response.status).toBe(200);
  });
});