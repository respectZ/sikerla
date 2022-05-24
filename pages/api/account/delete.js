import mysql_con from "../../../lib/mysl_con";

import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";

export default withIronSessionApiRoute(accountDeleteRoute, ironSessionConfig);

async function accountDeleteRoute(req, res) {
  if (!req.session.user && !req.session.admin)
    res.status(404).send("Not found.");
  if (req.method != "POST") {
    res.status(405).json({ error: true, message: "Only POST.", data: [] });
    return;
  }
  const body = req.body;
  mysql_con.deletePekerja(body["id"], (_err, _res) => {
    if (_err)
      res.status(200).json({ error: true, message: _err.message, data: _res });
    else res.status(200).json({ error: false, message: "ok", data: _res });
  });
}
