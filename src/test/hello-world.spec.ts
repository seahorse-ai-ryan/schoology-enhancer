describe('helloWorld function', () => {
  it('should return a 200 status code', async () => {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:9000/api/helloWorld');
    expect(response.status).toBe(200);
  });
});