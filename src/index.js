const cluster = require("cluster");
const getAedes = require("./aedes");

function startAedes() {
  const port = 1883;

  const aedes = getAedes(cluster);

  const server = require("net").createServer(aedes.handle);

  server.listen(port, function () {
    console.log("Aedes listening on port:", port);
    aedes.publish({ topic: "aedes/hello", payload: "I'm broker " + aedes.id });
  });
}

if (cluster.isMaster) {
  const numWorkers = require("os").cpus().length;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on("online", function (worker) {
    console.log("Worker " + worker.process.pid + " is online");
  });

  cluster.on("exit", function (worker, code, signal) {
    console.log(
      "Worker " +
        worker.process.pid +
        " died with code: " +
        code +
        ", and signal: " +
        signal
    );
    console.log("Starting a new worker");
    cluster.fork();
  });
} else {
  startAedes();
}
