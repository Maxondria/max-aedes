const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883", {
  password: "apiKey",
  username: "deviceId",
});

const topicToPublish = {
  topic: "device/can/log",
  messages: ["Message 1", "Message 2", "Message 3", "Message 4", "Message 5"],
};

client.on("connect", () => {
  // Demo Controller
  const { topic, messages } = topicToPublish;
  const topicOnclient = "some-apikey/some-deviceid";

  const publishedMap = new Map();

  const Intv = setInterval(() => {
    const random = Math.floor(Math.random() * messages.length);
    const message = messages[random];

    if (!publishedMap.has(message)) {
      client.publish(topic, JSON.stringify({ topicOnclient, message }));
      publishedMap.set(message, true);
    } else if (publishedMap.size === messages.length) {
      clearInterval(Intv);
      console.log("All messages published");
    }
  }, 5000);
});

//Handle errors
client.on("error", (error) => {
  console.log("Error: ", error.message);
});
