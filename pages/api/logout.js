import { withIronSessionApiRoute } from "iron-session/next";
import mysql_con from "../../lib/mysl_con";
import { ironSessionConfig } from "../../next.config";

export default withIronSessionApiRoute(async (req, res) => {
  const user = req.session.user;

  if (user) {
    mysql_con.deleteSession(req.session.user.nomor_hp, () => {});
    req.session.destroy();
  }
  res.redirect("/");
}, ironSessionConfig);
