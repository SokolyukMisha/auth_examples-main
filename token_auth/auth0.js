const request = require("request");

const yourDomain = "dev-5zk6y8jxxxxycbru.us.auth0.com";
const API_IDENTIFIER = "https://dev-5zk6y8jxxxxycbru.us.auth0.com/api/v2/";
const yourClientId = "QRIpfb7DPwkQAMQP1uz0DDxvFe62IBCO";
const client_secret =
  "NzwwczSWHhp9P2ZSdqM6jzUQZntfsNLyES71Gnwnuh3dbX80Aot0e29ah5rQu6zx";

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: `https://${yourDomain}/oauth/token`,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      form: {
        grant_type: "password",
        username: username,
        password: password,
        audience: API_IDENTIFIER,
        scope: "offline_access",
        client_id: yourClientId,
        client_secret: client_secret,
      },
    };
    request(options, (error, response, body) => {
      if (error) reject(error);
      resolve(body);
    });
  });
};


const refreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      url: `https://${yourDomain}/oauth/token`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      form: {
        client_id: yourClientId,
        client_secret: client_secret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    };
    request(options, (error, response, body) => {
      if (error) reject(error);
      resolve(body);
    });
  });
};

module.exports = {
  login,
  refreshToken,
};
