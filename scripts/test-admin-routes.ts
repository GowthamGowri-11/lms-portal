async function testRoutes() {
  const routes = [
    '',
    '/users',
    '/payments',
    '/courses',
    '/lessons',
    '/quizzes',
    '/problems',
    '/trainers',
    '/students',
    '/developers',
    '/requests',
    '/queries',
  ];

  console.log('Testing all Admin routes on http://localhost:3000/admin...');

  for (const r of routes) {
    const url = `http://localhost:3000/admin${r}`;
    try {
      const start = Date.now();
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const time = Date.now() - start;
      const isOk = res.status === 200;
      const hasError = html.includes('Application error') || html.includes('Unhandled Runtime Error');
      console.log(`${url.padEnd(42)} -> Status: ${res.status} | Time: ${time}ms | Length: ${html.length} | Error: ${hasError}`);
    } catch (err: any) {
      console.error(`${url.padEnd(42)} -> FAILED: ${err.message}`);
    }
  }
}

testRoutes();
