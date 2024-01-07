const axios = require('axios');

const yourDomain = 'dev-5zk6y8jxxxxycbru.us.auth0.com';
const API_IDENTIFIER = 'https://dev-5zk6y8jxxxxycbru.us.auth0.com/api/v2/';
const yourClientId = 'QRIpfb7DPwkQAMQP1uz0DDxvFe62IBCO';
const client_secret =
  'NzwwczSWHhp9P2ZSdqM6jzUQZntfsNLyES71Gnwnuh3dbX80Aot0e29ah5rQu6zx';

const AUTH0_URL = `https://${yourDomain}/`

const login = async (email, password) => {
  const response = await axios.post(AUTH0_URL + 'oauth/token', {
    grant_type: 'password',
    username: email,
    password: password,
    audience: API_IDENTIFIER,
    scope: 'offline_access',
    client_id: yourClientId,
    client_secret: client_secret,
  });

  if (response.status !== 200) {
    return null;
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(AUTH0_URL + 'oauth/token', {
    grant_type: 'refresh_token',
    refreshToken,
    client_id: yourClientId,
    client_secret: client_secret,
  });

  if (response.status !== 200) {
    return null;
  }

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const getAccessToken = async () => {
  try {
    const response = await axios.post(AUTH0_URL + 'oauth/token', {
      grant_type: 'client_credentials',
      audience: API_IDENTIFIER,
      client_id: yourClientId,
      client_secret: client_secret,
    });

    if (response.status !== 200) {
      return null;
    }

    return response.data.access_token;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createUser = async (email, password) => {
  try {
    const managementToken = await getAccessToken();
    const response = await axios.post(
      AUTH0_URL + 'api/v2/users',
      {
        email,
        password,
        connection: 'Username-Password-Authentication',
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      }
    );

    if (response.status !== 200) {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getLoginRedirectUri = () => {
  const localRedirectUri = encodeURIComponent('http://localhost:3000/oidc-callback');

  return `${AUTH0_URL}authorize?response_type=code&client_id=${yourClientId}&redirect_uri=${localRedirectUri}&scope=offline_access&audience=${API_IDENTIFIER}`;
};

const getTokensFromCode = async (code) => {
  try {
    const data = {
      grant_type: 'authorization_code',
      client_id: yourClientId,
      client_secret: client_secret,
      code: code,
      audience: API_IDENTIFIER,
      redirect_uri: 'http://localhost:3000',
    };

    const response = await axios.post(AUTH0_URL + 'oauth/token', data, {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    if (response.status !== 200) {
      return null;
    }

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  createUser,
  login,
  refreshAccessToken,
  getLoginRedirectUri,
  getTokensFromCode,
  AUTH0_URL
};
