import mysql_con from "../../lib/mysl_con";

import { withIronSessionApiRoute } from "iron-session/next";
import { ironSessionConfig } from "../../next.config";

export default withIronSessionApiRoute(loginRoute, ironSessionConfig);

function loginRoute(req, res) {
  if (req.method != "POST") {
    res.status(405).json({ error: true, message: "Only POST.", data: [] });
  } else {
    const body = req.body;
    if (!body["email"] && !body["password"])
      res.status(400).json({ error: true, message: "Missing data.", data: [] });
    else
      mysql_con.getUser(body["email"], body["password"], async (_err, _res) => {
        if (_err)
          res.status(400).json({
            error: true,
            message: _err.message,
            data: [],
          });
        else {
          req.session.user = {
            id: _res[0]["id_user"],
            admin: _res[0]["role"].toLowerCase() == "pemilik" ? true : false,
          };
          await req.session.save();
          res
            .status(200)
            .json({ error: false, message: "ok", data: [_res[0]] });
        }
      });
  }
}
