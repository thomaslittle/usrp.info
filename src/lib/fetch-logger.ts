const originalFetch = fetch;

if (typeof window !== 'undefined') {
  window.fetch = async (...args) => {
    const [url, config] = args;
    console.log('Intercepted fetch call to:', url);

    const response = await originalFetch(url, config);
    return response;
  };
} 