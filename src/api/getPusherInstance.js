import Pusher from "pusher-js";

/**
 * Returns singleton Pusher instance.
 *
 * Code using our Pusher socket instance should typically just call
 * this to get the instance rather than storing a reference to the
 * instance locally because this code does some preprocessing to
 * ensure the auth values are up to date.
 *
 * @returns {Pusher}
 */
export default function getPusherInstance() {
  return PusherFactory.getInstance();
}

/**
 * Factory for our Pusher singleton instance.
 *
 * @see getPusherInstance()
 * @see https://pub.dev/documentation/pusher_js/latest/pusher_js/Pusher-class.html
 *
 * @returns {Pusher}
 */
let PusherFactory = (function () {
  let instance;

  // Uncomment line below to include debugging output in your console.
  // Pusher.logToConsole = true;

  return {
    getInstance: function () {
      // Create new instance.
      if (!instance) {
        instance = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
          authEndpoint: process.env.REACT_APP_PUSHER_AUTH_URL,
          authTransport: "jsonp",
          cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
          forceTLS: true,
          enableStats: false,
        });

        // Log error if not in an automated test.
        if ("test" !== process.env.NODE_ENV) {
          instance.connection.bind("error", function (err) {
            console.log("process.env.NODE_ENV", process.env.NODE_ENV);
            console.error("Pusher instance error", err);
          });
        }
      }

      return instance;
    },
  };
})();
