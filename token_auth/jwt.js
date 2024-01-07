const jwkToPem = require('jwk-to-pem');
const jsonwebtoken = require('jsonwebtoken');
const axios = require('axios');
const {AUTH0_URL} = require('./auth0');

const getJwks = async () => {
  const response = await axios.get(AUTH0_URL + '.well-known/jwks.json');
  if (response.status !== 200) {
    return null;
  }

  return response.data.keys[0];
};

const validateJwt = async (token) => {
  const jwks = await getJwks();
  const validationResult = jsonwebtoken.verify(token, jwkToPem(jwks));

  return {
    principal: {
      username: validationResult.sub,
    },
    expires: new Date(Number(validationResult.exp) * 1000),
  };
};

module.exports = {
  validateJwt,
};
