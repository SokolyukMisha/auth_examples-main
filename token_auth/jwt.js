const fs = require("fs");
const { verify } = require("jsonwebtoken");

const validateJwt = (token) => {
  return new Promise((resolve, reject) => {
    const pem = fs.readFileSync("public.pem");
    verify(token, pem, {algorithms: ['RS256']}, (error, payload) => {
      if (error) reject(error);
      resolve(payload);
    });

  });
};

module.exports = {
  validateJwt
}