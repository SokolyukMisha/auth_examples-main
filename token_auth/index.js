const uuid = require("uuid");
const express = require("express");
const onFinished = require("on-finished");
const bodyParser = require("body-parser");
const path = require("path");
const port = 3000;
const fs = require("fs");
const auth0 = require("./auth0");
const { validateJwt } = require("./jwt");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = "Authorization";

class Session {
  #sessions = {};

  constructor() {
    try {
      this.#sessions = fs.readFileSync("./sessions.json", "utf8");
      this.#sessions = JSON.parse(this.#sessions.trim());

      console.log(this.#sessions);
    } catch (e) {
      this.#sessions = {};
    }
  }

  #storeSessions() {
    fs.writeFileSync(
      "./sessions.json",
      JSON.stringify(this.#sessions),
      "utf-8"
    );
  }

  set(key, value) {
    if (!value) {
      value = {};
    }
    this.#sessions[key] = value;
    this.#storeSessions();
  }

  get(key) {
    return this.#sessions[key];
  }

  init(res) {
    const sessionId = uuid.v4();
    this.set(sessionId);

    return sessionId;
  }

  destroy(req, res) {
    const sessionId = req.sessionId;
    delete this.#sessions[sessionId];
    this.#storeSessions();
  }
}

const sessions = new Session();

app.use((req, res, next) => {
  let currentSession = {};
  let sessionId = req.get(SESSION_KEY);

  if (sessionId) {
    currentSession = sessions.get(sessionId);
    if (!currentSession) {
      currentSession = {};
      sessionId = sessions.init(res);
    }
  } else {
    sessionId = sessions.init(res);
  }

  req.session = currentSession;
  req.sessionId = sessionId;

  onFinished(req, () => {
    const currentSession = req.session;
    const sessionId = req.sessionId;
    sessions.set(sessionId, currentSession);
  });

  next();
});

app.get("/", async (req, res) => {
  const accessToken = req.session.access_token;
  if (accessToken) {
    validateJwt(accessToken)
      .then((payload) => console.log(payload))
      .catch((error) => {
        throw new Error(error);
      });

    const tokenLifetime =
      req.session.expires_at - Math.floor(Date.now() / 1000);
    if (tokenLifetime <= 86385) {
      const response = await auth0.refreshToken(req.session.refresh_token);
      console.log("Old token:\n" + req.session.access_token);
      console.log("Token was refreshed");
      const responseObj = JSON.parse(response);
      console.log("New token:\n" + responseObj.access_token);
      req.session.access_token = responseObj.access_token;
      req.session.expires_at =
        Math.floor(Date.now() / 1000) + responseObj.expires_in;
    }

    return res.json({
      username: req.session.username,
      logout: "http://localhost:3000/logout",
    });
  }
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/logout", (req, res) => {
  sessions.destroy(req, res);
  res.redirect("/");
});

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const response = await auth0.login(login, password);
    const parsed = JSON.parse(response);
    req.session.username = login;
    req.session.login = login;
    req.session.access_token = parsed.access_token;
    req.session.expires_at = Math.floor(Date.now() / 1000) + parsed.expires_in;
    req.session.refresh_token = parsed.refresh_token;
    res.json({ token: req.sessionId });
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
