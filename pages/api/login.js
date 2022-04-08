import mysql_con from "../../lib/mysl_con";

export default function handler(req, res) {
  if (req.method != "POST") {
    res.status(405).json({ error: true, message: "Only POST.", data: [] });
  } else {
    const body = req.body;
    if (!body["email"] && !body["password"])
      res.status(400).json({ error: true, message: "Missing data.", data: [] });
    else
      mysql_con.getUser(body["email"], body["password"], (_err, _res) => {
        if (_err)
          res.status(400).json({
            error: true,
            message: _err.message,
            data: [],
          });
        else
          res
            .status(200)
            .json({ error: false, message: "ok", data: [_res[0]] });
      });
  }
}
