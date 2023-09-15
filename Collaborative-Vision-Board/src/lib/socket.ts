// @Elliott this is where we initalise the websocket client, we can then import
// this socket object into any component and use it to send and receive events

import { io } from "socket.io-client";

// @Elliott you have to change this to the URL of your backend
const URL = "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
});
