import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../next.config";

export default withIronSessionApiRoute(async (req, res) => {
  const user = req.session.user;
  if (user) await req.session.destroy();
  res.redirect("/");
}, ironSessionConfig);
