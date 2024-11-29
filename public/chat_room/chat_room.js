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

const showRoomList = async () => {
  const roomList = document.querySelector(".room-list");
  roomList.innerHTML = '';
  const rooms = await client.service("rooms").find(
    {
      query: {

      },
    }
  );

  console.log(rooms);

  rooms.forEach(addRoom);
}

let currentRoom = null;
const addRoom = (room) => {
  const roomList = document.querySelector(".room-list");

  const li = document.createElement('li');
  li.innerHTML = `
    <a class="block relative" href="#" id="room-id-${room.id}">
      <img src="./messenger.png" alt="" class="avatar">
      <span class="absolute roomname"
        style="
            font-size: 18;
            font-weight: bold;
        "
      >${escape(
        room.name
      )}</span>
    </a>
  `;

  li.addEventListener('click', async () => {
    await openRoom(room);
  });

  roomList.appendChild(li);

}

const showUnjoinedRoomList = async (name) => {
  const roomList = document.querySelector(".room-list");
  roomList.innerHTML = '';
  const rooms = await client.service("rooms").find(
    {
      query: {
        name: name,
      },
    }
  );

  rooms.forEach(addUnjoinedRoom);
}

const addUnjoinedRoom = (room) => {
  if(document.getElementById(`room-id-${room.id}`))
    return;

  const roomList = document.querySelector(".room-list");

  const li = document.createElement('li');
  li.innerHTML = `
    <a class="block relative" href="#" id="room-id-${room.id}">
      <img src="./chat.png" alt="" class="avatar">
      <span class="absolute roomname"
        style="
            font-size: 18;
            font-weight: bold;
        "
      >${escape(
        room.name
      )}</span>
    </a>
  `;

  li.addEventListener('click', async () => {
    await joinRoom(room);
  });

  roomList.appendChild(li);
}

const joinRoom = async (room) => {
  // open a promt to ask yes/no to join room
  console.log(`Ask to join ${room.name}`);
  const join = confirm(`Do you want to join room ${room.name}?`);
  if(join) {
    await client.service("rooms").update(room.id, {
      $push: {
        joinedBy: currentUser._id,
      }
    });
    
    await openRoom(room);

    document.getElementById('searchRoom').value = '';
    showRoomList();
  }
}

const openRoom = async (room) => {
  alert(`Open room ${room.name}`);
  const roomName = document.querySelector(".room-name");
  roomName.innerHTML = room.name;

  document.getElementById('select-chat-message').style.display = 'none';
  document.querySelector('.chat-content').style.display = 'flex';
  document.querySelector('.room-users').style.display = 'flex';

  currentRoom = room;
}

const closeRoom = async () => {
  document.getElementById('select-chat-message').style.display = 'flex';
  document.querySelector('.chat-content').style.display = 'none';
  document.querySelector('.room-users').style.display = 'none';

  currentRoom = null;
}


// Log in either using the given email/password or the token from storage
let currentUser = null;
const authUser = async (credentials) => {
  try {
    let res = null;
    if (!credentials) {
      // Try to authenticate using an existing token
      res = await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      res = await client.authenticate({
        strategy: "local",
        ...credentials,
      });
    }

    // get user id
    try {
      currentUser = res.user;
    } catch (error) {
      console.error("Authentication error:", error);
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

addEventListener("#add-room", "click", async () => {
  // show a prompt with input
  const roomName = prompt("Please enter room name");

  // Create a new room
  await client.service("rooms").create({
    name: roomName,
  });
});

addEventListener('#searchRoom', 'input', async (ev) => {
  
  clearTimeout(this.delay);
  this.delay = setTimeout(async function(){
    var text = document.getElementById('searchRoom').value;
      console.log(text);
      if(text && text != '')
          await showUnjoinedRoomList(text);
      else
          await showRoomList();
   }.bind(this), 300);
});

client.service(`rooms`).on("created", (data) => {
  if(data.createdBy == currentUser._id) 
    addRoom(data);
});

// Call login right away so we can show the chat window
// If the user can already be authenticated
authUser();
