export default function onRequest(context) {
  console.log('Hello from Edge Functions!');
  return new Response(`Hello from Edge Functions! ${context.env.WEBHOOK_TOKEN}`);
}