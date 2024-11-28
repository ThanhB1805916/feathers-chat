
// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());

let currentUser = null;

// Helper to safely escape HTML
const escape = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Add a new user to the list
const addUser = (user) => {
  const userList = document.querySelector(".user-list");

  if (userList) {
    // Add the user to the list
    userList.innerHTML += `<li>
      <a class="block relative" href="#">
        <img src="${user.avatar}" alt="" class="avatar">
        <span class="absolute username">${escape(
          user.name || user.email
        )}</span>
      </a>
    </li>`;
  }
};

// Renders a message to the page
const addMessage = (message) => {
  // The user that sent this message (added by the populate-user hook)
  const { user = {} } = message;
  const chat = document.querySelector(".chat");
  // Escape HTML to prevent XSS attacks
  const text = escape(message.text);

  if (chat) {
    chat.innerHTML += `<div class="message flex flex-row">
      <img src="${user.avatar}" alt="${user.name || user.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${escape(
            user.name || user.email
          )}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format(
            "MMM Do, hh:mm:ss"
          )}</span>
        </p>
        <p class="message-content font-300">${text}</p>
      </div>
    </div>`;

    // Always scroll to the bottom of our message list
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

const showRoomList = async () => {
  console.log("showRoomList");
  console.log(`${currentUser}`);

  const rooms = await client.service("room").find(
    {
      query: {
        createdById: currentUser._id,
      },
    }
  );
}

// Shows the chat page
const showChat = async () => {

  // Find the latest 25 messages. They will come with the newest first
  const messages = await client.service("messages").find({
    query: {
      $sort: { createdAt: -1 },
      $limit: 25,
    },
  });

  // We want to show the newest message last
  messages.data.reverse().forEach(addMessage);

  // Find all users
  const users = await client.service("users").find();

  // Add each user to the list
  users.data.forEach(addUser);
};

// Log in either using the given email/password or the token from storage
const authUser = async (credentials) => {
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

    try{
      const accessToken = await client.authentication.getAccessToken();
      console.log('Token:', accessToken);

      if (accessToken) {
        // Decode the token to get the payload
        const payload = jwtDecode(accessToken);
        console.log('Decoded Token Payload:', payload);
        
      } else {
        console.error('No access token found');
      }
      currentUser = payload;
    }catch(error){
      console.error(error);
    }

    showRoomList();
  } catch (error) {
    // If we got an error, show the login page
    console.error(error);
    window.location.href = '/';
  }
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async (ev) => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// "Send" message form submission handler
addEventListener("#send-message", "submit", async (ev) => {
  // This is the message text input field
  const input = document.querySelector('[name="text"]');

  ev.preventDefault();

  // Create a new message and then clear the input field
  await client.service("messages").create({
    text: input.value,
    roomId: 123,
  });

  input.value = "";
});

// Listen to created events and add the new message in real-time
client.service("messages").on("created", addMessage);

// We will also see when new users get created in real-time
client.service("users").on("created", addUser);

// Call login right away so we can show the chat window
// If the user can already be authenticated
authUser();
