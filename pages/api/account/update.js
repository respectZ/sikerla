import mysql_con from "../../../lib/mysl_con";

import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";

export default withIronSessionApiRoute(accountUpdateRoute, ironSessionConfig);

async function accountUpdateRoute(req, res) {
  if (!req.session.user) res.status(404).send("Not found.");
  if (req.method != "POST") {
    res.status(405).json({ error: true, message: "Only POST.", data: [] });
    return;
  }
  //   to do: only can update current account, otherwise need admin session
  const body = req.body;
  if (req.session.user.admin || req.body.id == req.session.user.id) {
    mysql_con.updateAkun(body["id"], body["data"], (_err, _res) => {
      if (_err)
        res
          .status(200)
          .json({ error: true, message: _err.message, data: _res });
      else res.status(200).json({ error: false, message: "ok", data: _res });
    });
  } else {
    res.status(400).json({
      error: true,
      message: "Pekerja tidak bisa mengganti akun lain",
      data: [],
    });
  }
}
