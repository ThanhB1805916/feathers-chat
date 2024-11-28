/* global io, feathers, moment */
// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());

// Helper to safely escape HTML
const escape = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");


// Retrieve email/password object from the login/signup page
const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  };

  return user;
};

// Log in either using the given email/password or the token from storage
const login = async (credentials) => {
  try {
    if (!credentials) {
      // Try to authenticate using an existing token
      await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await client.authenticate({
        strategy: "local",
        ...credentials,
      });
    }

    console.log("Authenticated!");
    // If successful, go to route /chat_room
    window.location.href = '/chat_room';
  } catch (error) {
    // If we got an error, show the login page
    if (document.querySelectorAll(".login").length && error) {
      document
        .querySelector("#login-error").textContent = error.message;
    } 
  }
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async (ev) => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// "Signup and login" button click handler
addEventListener("#signup", "click", async () => {
  // For signup, create a new user and then log them in
  const credentials = getCredentials();

  // First create the user
  await client.service("users").create(credentials);
  // If successful log them in
  await login(credentials);
});

// "Login" button click handler
addEventListener("#login", "click", async () => {
  const user = getCredentials();

  await login(user);
});

// "Logout" button click handler
addEventListener("#logout", "click", async () => {
  await client.logout();

  document.getElementById("app").innerHTML = loginHTML;
});

// Call login right away so we can show the chat window
// If the user can already be authenticated
login();
