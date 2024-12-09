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
  const join = confirm(`Do you want to join room ${room.name}?`);
  if(join) {
    await client.service("rooms").update(room.id, { },
    {
      query: {
        join: true,
      }
    })
    ;
    
    await openRoom(room);

    document.getElementById('searchRoom').value = '';
    showRoomList();
  }
}

const openRoom = async (room) => {
  const roomName = document.querySelector(".room-name");
  roomName.innerHTML = room.name;

  document.getElementById('select-chat-message').style.display = 'none';
  document.querySelector('.chat-content').style.display = 'flex';
  document.querySelector('.room-users').style.display = 'flex';

  await loadRoomInfo(room);
  
  await Promise.all([
    showUserList(),
    showMessageList()
  ]);
}

const loadRoomInfo = async (room) => {
  const roomData = await client.service("rooms").find({
    query: {
      roomId: room.id,
    },
  });

  currentRoom = roomData[0];
}

const leaveRoom = async () => {
  let leave = confirm(`Confirm to leave room ${currentRoom.name}?`);

  if(leave) {
    await client.service("rooms").update(currentRoom.id, { },
    {
      query: {
        leave: true,
      }
    });

    await closeRoom();
    showRoomList();
  }
}

const closeRoom = async () => {
  document.getElementById('select-chat-message').style.display = 'flex';
  document.querySelector('.chat-content').style.display = 'none';
  document.querySelector('.room-users').style.display = 'none';

  currentRoom = null;
}

const showUserList = async () => {
  const roomUsers = document.querySelector(".user-list");
  roomUsers.innerHTML = '';
  currentRoom.users.forEach(addUser);
}

const addUser = (user) => {
  const roomUsers = document.querySelector(".user-list");

  const li = document.createElement('li');
  li.innerHTML = `
    <a class="block relative" href="#" id="user-id-${user.id}">
      <img src="${user.avatar}" alt="" class="avatar">
      <span class="absolute username"
        style="
            font-size: 18;
            font-weight: bold;
        "
      >${escape(
        user.email
      )}</span>
    </a>
  `;

  roomUsers.appendChild(li);  
}

const showMessageList = async () => {
  const messages = document.getElementById("chat-messages");
  messages.innerHTML = '';

  const messageList = await client.service("messages").find({
    query: {
      roomId: currentRoom.id,
    },
  });

  messageList.forEach(addMessage);
}

let lastUserId=null;
const addMessage = (message) => {
  const messages = document.getElementById("chat-messages");
  const item = document.createElement("li");
  item.style.listStyleType = "none";
  item.innerHTML =``;

  if (message.user.id === currentUser._id) {
    item.style.textAlign = "right"; 
  }
  if (lastUserId == null || lastUserId != message.user.id) {
    item.innerHTML += `
      <div>
        <img src="${message.user.avatar}" alt="" class="avatar">
        <strong class="username">${escape(message.user.email)}</strong>
      </div>
    `;
  }
  
  item.innerHTML += `
    <p>${escape(message.text)}</p>
  `;
  
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;

  lastUserId = message.user.id;
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
    roomId: currentRoom.id,
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

client.service('rooms').on('updated', async (data) => {
  if(currentRoom?.id == data.room.id) {
    await loadRoomInfo(currentRoom);
    await showUserList();
  }
});

client.service('messages').on('created', async (data) => {
  if(currentRoom?.id == data.room.id) {
    addMessage(data);
  }
});


const leaveRoomBtn = document.getElementById('leaveRoom');
leaveRoomBtn.addEventListener('click', async () => {
  await leaveRoom();
});

const logOutBtn = document.getElementById('logOut');
logOutBtn.addEventListener('click', async () => {
  await client.logout();
  window.location.href = '/';
});

// Call login right away so we can show the chat window
// If the user can already be authenticated
authUser();
