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
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "linkKeyProperty": "key",
  "nodeDataArray": [
  {"category":"Comment", "loc":"360 -10", "text":"Kookie Brittle", "key":-13},
  {"key":-1, "category":"Start", "loc":"175 0", "text":"Start"},
  {"key":0, "loc":"-5 75", "text":"Preheat oven to 375 F"},
  {"key":1, "loc":"175 100", "text":"In a bowl, blend: 1 cup margarine, 1.5 teaspoon vanilla, 1 teaspoon salt"},
  {"key":2, "loc":"175 200", "text":"Gradually beat in 1 cup sugar and 2 cups sifted flour"},
  {"key":3, "loc":"175 290", "text":"Mix in 6 oz (1 cup) Nestle's Semi-Sweet Chocolate Morsels"},
  {"key":4, "loc":"175 380", "text":"Press evenly into ungreased 15x10x1 pan"},
  {"key":5, "loc":"355 85", "text":"Finely chop 1/2 cup of your choice of nuts"},
  {"key":6, "loc":"175 450", "text":"Sprinkle nuts on top"},
  {"key":7, "loc":"175 515", "text":"Bake for 25 minutes and let cool"},
  {"key":8, "loc":"175 585", "text":"Cut into rectangular grid"},
  {"key":-2, "category":"End", "loc":"175 660", "text":"Enjoy!"}
  ],
  "linkDataArray": [
  {"from":1, "to":2, "fromPort":"B", "toPort":"T"},
  {"from":2, "to":3, "fromPort":"B", "toPort":"T"},
  {"from":3, "to":4, "fromPort":"B", "toPort":"T"},
  {"from":4, "to":6, "fromPort":"B", "toPort":"T"},
  {"from":6, "to":7, "fromPort":"B", "toPort":"T"},
  {"from":7, "to":8, "fromPort":"B", "toPort":"T"},
  {"from":8, "to":-2, "fromPort":"B", "toPort":"T"},
  {"from":-1, "to":0, "fromPort":"B", "toPort":"T"},
  {"from":-1, "to":1, "fromPort":"B", "toPort":"T"},
  {"from":-1, "to":5, "fromPort":"B", "toPort":"T"},
  {"from":5, "to":4, "fromPort":"B", "toPort":"T"},
  {"from":0, "to":4, "fromPort":"B", "toPort":"T"}
  ]}`);
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
    <div className="max-w-7xl mx-auto py-20">
      <h1>Collaborative Flowchart :)</h1>
      <Diagram modelJson={modelJson} setModelJson={setModelJson} />
      <Toaster />
    </div>
  );
}

export default App;
