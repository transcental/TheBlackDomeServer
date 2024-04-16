const playerId = Math.floor(Math.random() * Date.now())

function send(data, type) {
  const req = {
    ...data,
    timestamp: Date.now(),
    playerId,
    type
  }
  ws.send(JSON.stringify(req));

  if (type == "message") { 
  document.getElementById("message").value = "";
  const ul = document.getElementById("messages") ;
  const li = document.createElement("li");
  li.innerText = `Me: ${data.message}`;
  ul.appendChild(li);
  }
}

function onSubmitText(e) {
  e.preventDefault();
  send({message: document.getElementById("message").value}, "message");
}

function createPoll(title, id, options, startTime, endTime) {
  const pollsContainer = document.getElementById("polls");
  const pollContainer = document.createElement("div");
  pollContainer.classList.add("poll");
  pollContainer.id = id;
  pollsContainer.appendChild(pollContainer);

  const heading = document.createElement("h2");
  heading.innerText = title;
  heading.classList.add("poll-title");
  pollContainer.appendChild(heading);

  options.forEach((option) => {
    const button = document.createElement("button");
    button.innerText = option.name;
    button.value = option.id;
    button.classList.add("poll-button")
    button.onclick = function () {vote(this)};
    pollContainer.appendChild(button);
  });
}

function vote(btn) {
  console.log(`Voted for ${btn.value}`)
  send({
    optionId: btn.value,
    pollId: btn.parentElement.id
  }, "vote")

}

const ws = new WebSocket(`wss://${window.location.host}`);
ws.onopen = () => {
  console.log("Connected to server");
  document.getElementById("status").innerText = "Status: Connected";
  send("Hello Bun, I'm a player!")
};

ws.onmessage = (message) => {
  const data = JSON.parse(message.data);
  console.log("Received message:", message, data);

  switch (data.type) {
    case "poll":
      console.log("Poll received, setting up", data)
      createPoll(data.title, data.id, data.options, data.timestamp, data.endTime);
      break
    case "message":
      const ul = document.querySelector("ul");
      const li = document.createElement("li");
      li.innerText = `${data.playerId ? "Player" : 'Unity'}: ${data.message}`;
      ul.appendChild(li);
      break;
    case "vote":
      console.log("Vote received");
      break;
    case "announcement":
      console.log("Announcement received");
      break;
    case "voteClosure":
      console.log("Vote Closure received");
      break;
  }
};

ws.onclose = () => {
  console.log("Disconnected from server");
  document.getElementById("status").innerText = "Status: Disconnected";
};

ws.onerror = (error) => {
  console.error("Error:", error);
  document.getElementById("status").innerText = "Status: Error";
};