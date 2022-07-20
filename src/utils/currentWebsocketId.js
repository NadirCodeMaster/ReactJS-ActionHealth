import getPusherInstance from 'api/getPusherInstance';

/**
 * Get the current websocket connection ID, if any.
 *
 * @returns {string|null}
 */
export default function currentWebsocketId() {
  let sock = getPusherInstance();
  if (sock && sock.connection && sock.connection.socket_id) {
    return sock.connection.socket_id;
  }
  return null;
}
