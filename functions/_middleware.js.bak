export async function onRequest(context) {
  const { request, next } = context;
  
  // Basic認証の設定
  const USERNAME = "itonoba";
  const PASSWORD = "iihinseiri";
  
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }
  
  const encoded = authHeader.substring(6);
  const decoded = atob(encoded);
  const [user, pass] = decoded.split(":");
  
  if (user !== USERNAME || pass !== PASSWORD) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }
  
  return next();
}
