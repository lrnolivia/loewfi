type PagesContext = {
  request: Request;
};

export async function onRequestGet({ request }: PagesContext): Promise<Response> {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');

  return Response.json(
    {
      ok: true,
      email,
      accessJwtPresent: Boolean(jwt),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
