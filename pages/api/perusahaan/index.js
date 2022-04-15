import mysql_con from "../../../lib/mysl_con";

import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";

export default withIronSessionApiRoute(perusahaanRoute, ironSessionConfig);

function perusahaanRoute(req, res) {
  if (req.method != "GET") {
    res.status(405).json({ error: true, message: "Only GET.", data: [] });
    return;
  }
  mysql_con.getProfilPerusahaan((_err, _res) => {
    res.status(200).json({ error: false, message: "ok", data: _res });
  });
}
