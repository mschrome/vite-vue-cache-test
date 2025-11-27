export default function onRequest(context) {
  console.log('Hello from Edge Functions!', test);
  return new Response('Hello from Edge Functions!');
}