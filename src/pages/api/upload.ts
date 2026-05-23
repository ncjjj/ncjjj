export default async function handler(
  _req: unknown,
  res: {
    status: (code: number) => { json: (body: { message: string }) => void };
  }
) {
  res.status(404).json({ message: "Service upload API disabled." });
}
