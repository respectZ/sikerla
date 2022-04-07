import mysql_con from "../../lib/mysl_con";
import util from "../../lib/util";

export default function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).json({ error: true, message: "Only POST.", data: [] });
  } else {
    const body = JSON.parse(req.body);

    if (!body["email"] && !body["password"])
      res.status(400).json({ error: true, message: "Missing data.", data: [] });

    mysql_con.getUser(
      body["email"],
      util.hash(body["password"]),
      (_err, _res) => {
        if (_err) throw _err;
        res.status(200).json({ error: false, message: "ok", data: _res[0] });
      }
    );

    res.status(400).json({ error: true, message: "Missing data.", data: [] });
  }
}
