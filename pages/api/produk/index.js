import mysql_con from "../../../lib/mysl_con";

import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";

export default withIronSessionApiRoute(produkRoute, ironSessionConfig);

function produkRoute(req, res) {
  if (!req.session.user) res.status(404).send("Not found.");
  if (req.method != "GET") {
    res.status(405).json({ error: true, message: "Only GET.", data: [] });
    return;
  }
  const query = req.query;
  mysql_con.getProduk({
    date: req.query?.date,
    callback: (_err, _res) => {
      res.status(200).json({ error: false, message: "ok", data: _res });
    },
  });
}
