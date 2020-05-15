const mqemitter = require("mqemitter-mongodb");
const mongoPersistence = require("aedes-persistence-mongodb");

const MONGO_URL = "mongodb://localhost:27017/aedes-clusters";

function getAedes(cluster) {
  const aedes = require("aedes")({
    id: "BROKER_" + cluster.worker.id,
    mq: mqemitter({
      url: MONGO_URL,
    }),
    persistence: mongoPersistence({
      url: MONGO_URL,
      // Optional ttl settings
      ttl: {
        packets: 300, // Number of seconds
        subscriptions: 300,
      },
    }),
  });

  aedes.authenticate = function (client, username, password, callback) {
    const authorized =
      username === "deviceId" && password.toString() === "apiKey";
    callback(null, authorized);
  };

  aedes.on("subscribe", function (subscriptions, client) {
    console.log(
      "MQTT client \x1b[32m" +
        (client ? client.id : client) +
        "\x1b[0m subscribed to topics: " +
        subscriptions.map((s) => s.topic).join("\n"),
      "from broker",
      aedes.id
    );
  });

  aedes.on("unsubscribe", function (subscriptions, client) {
    console.log(
      "MQTT client \x1b[32m" +
        (client ? client.id : client) +
        "\x1b[0m unsubscribed to topics: " +
        subscriptions.join("\n"),
      "from broker",
      aedes.id
    );
  });

  // fired when a client connects
  aedes.on("client", function (client) {
    console.log(
      "Client Connected: \x1b[33m" + (client ? client.id : client) + "\x1b[0m",
      "to broker",
      aedes.id
    );
  });

  // fired when a client disconnects
  aedes.on("clientDisconnect", function (client) {
    console.log(
      "Client Disconnected: \x1b[31m" +
        (client ? client.id : client) +
        "\x1b[0m",
      "to broker",
      aedes.id
    );
  });

  // fired when a message is published
  aedes.on("publish", async function (packet, client) {
    console.log(
      "Client \x1b[31m" +
        (client ? client.id : "BROKER_" + aedes.id) +
        "\x1b[0m has published",
      packet.payload.toString(),
      "on",
      packet.topic,
      "to broker",
      aedes.id
    );
    if (packet.topic === "device/can/log") {
      const { topicOnclient, message } = JSON.parse(packet.payload.toString());

      aedes.publish({
        topic: topicOnclient,
        payload:
          "I was intercepted by broker but my original payload is:  " + message,
      });
    }
  });

  return aedes;
}

module.exports = getAedes;
