/* global io, feathers, moment */

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());

const showSuggestFriend = async () => {
  const suggest = document.getElementById("suggest");
  const template = document.getElementById("suggest-template");
  const auth = await client.get("authentication");
  console.log("🚀 ~ showSuggestFriend ~ auth:", auth);

  const friends = await client.service("friends").find({
    query: {
      suggestion: true,
      id: auth.user._id,
    },
  });

  friends.forEach((friend) => {
    const friendDiv = document.importNode(template.content, true);

    // Set a unique ID for the cloned element
    const containerDiv = friendDiv.querySelector("div"); // Adjust if the template's root is different
    containerDiv.id = `suggest-${friend.id}`;
    friendDiv.querySelector("#avatar").src = friend.avatar;
    friendDiv.querySelector("#email").textContent = friend.email;

    // Attach click event to the button
    const ketBanButton = friendDiv.querySelector(".btn-primary");
    ketBanButton.addEventListener("click", async () => {
      try {
        await client.service("friends").create(
          {
            id1: auth.user._id,
            id2: friend.id,
          },
          {
            query: { beFriend: true },
          }
        );

        console.log("Kết bạn clicked for ", friend.email);

        // Disable the button and show an alert
        ketBanButton.disabled = true;
        alert("Đã gửi lời mời kết bạn");
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    });

    // Append the cloned template content to the suggest container
    suggest.appendChild(friendDiv);
  });
};

const showBeFriend = async () => {
  const auth = await client.get("authentication");
  const friends = await client.service("friends").find({
    query: {
      beFriend: true,
      id: auth.user._id,
    },
  });

  await renderBeFriend({
    friends,
    auth,
  });
};

async function renderBeFriend({ friends, auth }) {
  const beFriendEl = document.getElementById("be-friend");
  const template = document.getElementById("be-friend-template");

  friends.forEach((friend) => {
    const friendId = `be-friend-${friend.id}`; // Calculate the ID once

    // Check if a friend with this ID already exists
    let existingFriendDiv = document.getElementById(friendId);

    if (existingFriendDiv) {
      // Friend already rendered, update if needed or skip
      // You might want to update information here if needed:
      // existingFriendDiv.querySelector("#avatar").src = friend.avatar;
      // existingFriendDiv.querySelector("#email").textContent = friend.email;
      return; // Skip to the next friend
    }

    const friendDiv = document.importNode(template.content, true);

    // Set a unique ID for the cloned element
    const containerDiv = friendDiv.querySelector("div"); // Adjust if the template's root is different
    containerDiv.id = friendId;
    friendDiv.querySelector("#avatar").src = friend.avatar;
    friendDiv.querySelector("#email").textContent = friend.email;

    // Attach click event to the button
    const dongYButton = friendDiv.querySelector(".btn-success");
    dongYButton.addEventListener("click", async () => {
      try {
        await client.service("friends").create({
          id1: auth.user._id,
          id2: friend.id,
        });

        console.log("Đồng ý clicked for ", friend.email);

        containerDiv.remove();
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    });

    const tuChoiButton = friendDiv.querySelector(".btn-outline-danger");
    tuChoiButton.addEventListener("click", async () => {
      try {
        await client.service("friends").remove(null, {
          query: { beFriend: true, id1: auth.user._id, id2: friend.id },
        });

        console.log("Từ chối clicked for ", friend.email);

        containerDiv.remove();
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    });

    // Append the cloned template content to the suggest container
    beFriendEl.appendChild(friendDiv);
  });
}

const showFriend = async () => {
  const friendEl = document.getElementById("friend");
  const template = document.getElementById("friend-template");
  const auth = await client.get("authentication");

  const friends = await client.service("friends").find({
    query: {
      id: auth.user._id,
    },
  });

  friends.forEach((friend) => {
    const friendDiv = document.importNode(template.content, true);

    // Set a unique ID for the cloned element
    const containerDiv = friendDiv.querySelector("div"); // Adjust if the template's root is different
    containerDiv.id = `friend-${friend.id}`;
    friendDiv.querySelector("#avatar").src = friend.avatar;
    friendDiv.querySelector("#email").textContent = friend.email;

    // Attach click event to the button
    const ketBanButton = friendDiv.querySelector(".btn-outline-primary");
    ketBanButton.addEventListener("click", async () => {
      try {
        // await client.service("friends").create(
        //   {
        //     id1: auth.user._id,
        //     id2: friend.id,
        //   },
        //   {
        //     query: { beFriend: true },
        //   }
        // );

        console.log("Kết bạn clicked for ", friend.email);

        // Disable the button and show an alert
        ketBanButton.disabled = true;
        // alert("Đã gửi lời mời kết bạn");
        window.location.replace("/chat_room");
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    });

    // Append the cloned template content to the suggest container
    friendEl.appendChild(friendDiv);
  });
};

// Log in either using the given email/password or the token from storage
const login = async () => {
  try {
    // Try to authenticate using an existing token
    await client.reAuthenticate();

    // If successful, show the chat page
    await Promise.all([showSuggestFriend(), showBeFriend(), showFriend()]);
  } catch (error) {
    // If we got an error, navigate back login
    if (error.name == "NotAuthenticated") {
      window.location.href = "/";
      return;
    }

    console.error(error);
  }
};

const friendCreated = async (data) => {
  const auth = await client.get("authentication");
  if (!(data.u1.id == auth.user._id || data.u2.id == auth.user._id)) {
    return;
  }

  if (data.beFriend) {
    if (auth.user._id == data.u2.id) {
      alert(`Có lời mời kết bạn từ ${data.u1.email}`);
      await renderBeFriend({
        friends: [data.u1],
        auth,
      });
    }
  }
};

client.service("friends").on("created", friendCreated);

// Call login right away so we can show the chat window
// If the user can already be authenticated
login();
