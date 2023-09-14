import React from "react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";

// these are the schemas that define the shape of the form
import { schema } from "./form/schema";
import { uischema } from "./form/uischema";
import { socket } from "./lib/socket";
import toast from "react-hot-toast";
import useMousePosition from "./hooks/useMousePosition";
import type { mouseMoveServer } from "./socket.schema";

function App() {
  const [data, setData] = React.useState({});
  const mousePosition = useMousePosition();

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
      mouseDiv.style.backgroundColor = "red";
      mouseDiv.style.borderRadius = "50%";
      document.body.appendChild(mouseDiv);
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
      <h1 className="text-2xl font-bold">BE Form</h1>
      <p>
        We can define forms in the JSON schema, this JsonForms library component
        will then take our JSON schema and convert it into UI
      </p>
      <div className="mt-8"></div>
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data }) => setData(data)}
      />
    </div>
  );
}

export default App;
