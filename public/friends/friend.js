/* global io, feathers, moment */
// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());

const showFriend = async () => {
  const suggest = document.getElementById("suggest");
  const template = document.getElementById("friend-template").content;

  const friends = await client.service("friends").find();

  friends.forEach((friend) => {
    const friendDiv = document.importNode(template, true); // Create a copy of template

    friendDiv.querySelector("#avatar").src = friend.avatar;
    friendDiv.querySelector("#email").textContent = friend.email;


    suggest.appendChild(friendDiv);
  });
};

// Log in either using the given email/password or the token from storage
const login = async () => {
  try {
    // Try to authenticate using an existing token
    await client.reAuthenticate();

    // If successful, show the chat page
    showFriend();
  } catch (error) {
    console.error(error);
    // If we got an error, navigate back login
    window.location.href = "/";
  }
};

// We will also see when new users get created in real-time
// client.service("users").on("created", addUser);

// Call login right away so we can show the chat window
// If the user can already be authenticated
login();
