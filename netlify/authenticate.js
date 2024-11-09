// netlify/functions/authenticate.js
const crypto = require('crypto');

exports.handler = async (event) => {
  const { password } = JSON.parse(event.body);
  const storedHash = process.env.PASSWORD_HASH;

  // Simple hash function to hash the incoming password
  const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  // Compare the hashed password with the stored hash
  const userHash = hashPassword(password);
  if (userHash === storedHash) {
    return {
      statusCode: 200,
      body: JSON.stringify({ authenticated: true }),
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ authenticated: false }),
    };
  }
};
