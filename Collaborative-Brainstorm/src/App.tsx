import React from "react";
import Diagram from "./Diagram";
import { socket } from "./lib/socket";
import toast, { Toaster } from "react-hot-toast";
import { mouseMoveServer } from "./socket.schema";
import useMouse from "./hooks/useMouse";

function App() {
  const mousePosition = useMouse();
  const [modelJson, setModelJson] =
    React.useState(`{ "class": "go.GraphLinksModel",
    "linkKeyProperty": "key",
    "nodeDataArray": [
  {"key":1, "isGroup":true, "text":"Main 1", "horiz":true},
  {"key":2, "isGroup":true, "text":"Main 2", "horiz":true},
  {"key":3, "isGroup":true, "text":"Group A", "group":1},
  {"key":4, "isGroup":true, "text":"Group B", "group":1},
  {"key":5, "isGroup":true, "text":"Group C", "group":2},
  {"key":6, "isGroup":true, "text":"Group D", "group":2},
  {"key":7, "isGroup":true, "text":"Group E", "group":6},
  {"text":"first A", "group":3, "key":-7},
  {"text":"second A", "group":3, "key":-8},
  {"text":"first B", "group":4, "key":-9},
  {"text":"second B", "group":4, "key":-10},
  {"text":"third B", "group":4, "key":-11},
  {"text":"first C", "group":5, "key":-12},
  {"text":"second C", "group":5, "key":-13},
  {"text":"first D", "group":6, "key":-14},
  {"text":"first E", "group":7, "key":-15}
   ],
    "linkDataArray": [  ]}
    `);
  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      toast.success("Connected to server socket");
      console.log("connected");
    });

    socket.on("userDisconnected", (id: string) => {
      const mouseDiv = document.getElementById(`mouse-${id}`);
      if (mouseDiv) {
        mouseDiv.remove();
      }
    });

    socket.on("mouseMove", (data: mouseMoveServer) => {
      // that is our own mouse position, ignore it
      if (data.id === socket.id) return;

      // we can use this to render the mouse position of other users
      let mouseDiv = document.getElementById(`mouse-${data.id}`);
      if (!mouseDiv) {
        mouseDiv = document.createElement("div");
        mouseDiv.id = `mouse-${data.id}`;
      }
      mouseDiv.style.position = "absolute";
      mouseDiv.style.left = `${data.mousePosition.x}px`;
      mouseDiv.style.top = `${data.mousePosition.y}px`;
      mouseDiv.style.width = "10px";
      mouseDiv.style.height = "10px";
      mouseDiv.innerText = "user " + data.id;
      mouseDiv.style.color = "white";
      mouseDiv.style.backgroundColor = "red";
      mouseDiv.style.borderRadius = "50%";
      document.body.appendChild(mouseDiv);
    });

    socket.on("modelChange", (data: string) => {
      setModelJson(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  React.useEffect(() => {
    socket.emit("mouseMove", mousePosition);
  }, [mousePosition]);

  return (
    <div className="py-20 mx-auto max-w-7xl">
      <h1>Collaborative Brainstorm :)</h1>
      <Diagram modelJson={modelJson} setModelJson={setModelJson} />
      <Toaster />
    </div>
  );
}

export default App;
