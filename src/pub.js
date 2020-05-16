const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883", {
  clientId: "5e8a07a2945ed570613752cf/S8MF0KT-36C4MTY-JDZC84X-8XN9C1D",
  password: "S8MF0KT-36C4MTY-JDZC84X-8XN9C1D",
  username: "5e8a07a2945ed570613752cf",
});

const LOGGED =
  "5e8a07a2945ed570613752cf/S8MF0KT-36C4MTY-JDZC84X-8XN9C1D/LOGGED";
const LOGGING_ERROR =
  "5e8a07a2945ed570613752cf/S8MF0KT-36C4MTY-JDZC84X-8XN9C1D/ERROR";

const topicToPublish = {
  topic: "device/data/LOG",
  messages: ["20kW", "30kW", "40kW", "50kW", "60kW"],
};

client.on("connect", () => {
  client.subscribe(LOGGED);
  client.subscribe(LOGGING_ERROR);
  // Demo Controller
  const { topic, messages } = topicToPublish;

  const publishedMap = new Map();

  const Intv = setInterval(() => {
    const random = Math.floor(Math.random() * messages.length);
    const message = messages[random];

    if (!publishedMap.has(message)) {
      client.publish(topic, JSON.stringify({ volts: random, watts: message }));
      publishedMap.set(message, true);
    } else if (publishedMap.size === messages.length) {
      clearInterval(Intv);
      console.log("All messages published");
    }
  }, 5000);
});

client.on("message", (topic, payload) => {
  if (topic === LOGGED) {
    console.log("Data Logged: ", payload.toString());
  } else if (topic === LOGGING_ERROR) {
    console.log("Error Logging: ", payload.toString());
  }
});

//Handle errors
client.on("error", (error) => {
  console.log("Error: ", error.message);
});
