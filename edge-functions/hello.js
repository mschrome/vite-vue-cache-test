export default function onRequest(context) {
  console.log('Hello from Edge Functions!', context.env.WEBHOOK_TOKEN);
  return new Response('Hello from Edge Functions!');
}