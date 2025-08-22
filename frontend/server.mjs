import https from "https";
import fs from "fs";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3009;
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./cert/cert-key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, "0.0.0.0", () => {
      console.log("> Frontend running at https://localhost:" + port);
    });
});