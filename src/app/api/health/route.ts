export async function GET() {
  return Response.json({
    ok: true,
    service: "remediation-twin",
    time: new Date().toISOString()
  });
}
