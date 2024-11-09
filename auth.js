// auth.js

// Function to prompt for password and verify via serverless function
async function promptForPassword() {
  const userPassword = prompt('Enter your password to access ChatGPT PWA:');
  if (userPassword) {
    const response = await fetch('/.netlify/functions/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: userPassword }),
    });

    const result = await response.json();
    if (result.authenticated) {
      // Store a flag in sessionStorage to avoid repeated prompts in this session
      sessionStorage.setItem('authenticated', 'true');
      return true;
    } else {
      alert('Incorrect password. Please try again.');
      return false;
    }
  }
  return false;
}

// Check if the user is already authenticated
async function checkAuthentication() {
  if (sessionStorage.getItem('authenticated') === 'true') {
    return true;
  } else {
    return await promptForPassword();
  }
}

export { checkAuthentication };
