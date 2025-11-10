export const onRequestGet = async (context: unknown): Promise<Response> => {
  console.log('Hello, World!', my_kv);
  return new Response('Hello, World!', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
  });
};

