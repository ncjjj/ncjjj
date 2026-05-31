export async function POST(request: Request) {
  return new Response(JSON.stringify({ message: "Registration is disabled. Ask an admin to create your credentials." }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}