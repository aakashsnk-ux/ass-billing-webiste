// Very simple auth: ek hi fixed user, ek fixed token.
// Token match nahi hua to request reject.
export function requireAuth(req, res, next) {
  const token = req.headers["x-auth-token"];
  if (!token || token !== process.env.AUTH_TOKEN) {
    return res.status(401).json({ error: "Login required" });
  }
  next();
}
