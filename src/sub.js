const mqtt = require("mqtt");

// Demo Device
const clientId = "some-apikey/some-deviceid";

const client = mqtt.connect("mqtt://localhost:1883", {
  username: "deviceId",
  password: "apiKey",
  clientId,
});

client.on("connect", () => {
  client.subscribe(clientId);
});

client.on("message", (topic, message, packet) => {
  if (topic === clientId) {
    message = message.toString();
    console.log(("message:", message));
    // console.log(packet.properties.userProperties);
  }
});

//Handle errors
client.on("error", (error) => {
  console.log("Error: ", error.message);
});
