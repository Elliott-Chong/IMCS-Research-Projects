import React, { useEffect, useRef } from "react";
import go from "gojs";
import {
  defaultColor,
  defaultFont,
  highlightGroup,
  makeLayout,
} from "./goUtils";
import { socket } from "./lib/socket";

type Props = {
  modelJson: string;
  setModelJson: React.Dispatch<React.SetStateAction<string>>;
};

const FlowchartDiagram: React.FC<Props> = ({ modelJson, setModelJson }) => {
  const myDiagram = useRef<go.Diagram | null>(null);
  const diagramDivRef = useRef<HTMLDivElement | null>(null);
  const paletteDivRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (myDiagram.current && modelJson) {
      // @Elliott this is where you would apply the incrementalJSON to the model that is received from websockets
      console.log(modelJson);
      myDiagram.current.model.applyIncrementalJson(modelJson);
    }
  }, [modelJson]);

  useEffect(() => {
    const init = () => {
      if (myDiagram.current) return;
      if (!diagramDivRef.current || !paletteDivRef.current) return;
      const $ = go.GraphObject.make;
      myDiagram.current = $(go.Diagram, diagramDivRef.current, {
        mouseDrop: (e: go.InputEvent) => finishDrop(e, null),
        layout: new go.GridLayout({
          wrappingWidth: Infinity,
          alignment: go.GridLayout.Position,
          cellSize: new go.Size(1, 1),
        }),
        "commandHandler.archetypeGroupData": {
          isGroup: true,
          text: "Group",
          horiz: false,
        },
        "undoManager.isEnabled": true,
      });

      const finishDrop = (e: go.InputEvent, grp: go.GraphObject | null) => {
        if (myDiagram.current) {
          const ok =
            grp !== null
              ? // @ts-ignore
                grp.addMembers(grp.diagram.selection, true)
              : e.diagram.commandHandler.addTopLevelParts(
                  e.diagram.selection,
                  true
                );
          if (!ok) e.diagram.currentTool.doCancel();
        }
      };

      const expandGroups = (g: go.Group, i: number, level: number) => {
        if (!(g instanceof go.Group)) return;
        g.isSubGraphExpanded = i < level;
        // @ts-ignore
        g.memberParts.each((m) => expandGroups(m, i + 1, level));
      };

      // Group Template
      myDiagram.current.groupTemplate = new go.Group(go.Group.Auto, {
        background: "blue",
        ungroupable: true,
        mouseDragEnter: (e: go.InputEvent, grp: go.GraphObject) =>
          highlightGroup(e, grp, true),
        mouseDragLeave: (e: go.InputEvent, grp: go.GraphObject) =>
          highlightGroup(e, grp, false),
        computesBoundsAfterDrag: true,
        computesBoundsIncludingLocation: true,
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true,
        layout: makeLayout(false),
      })
        .bind("layout", "horiz", makeLayout)
        .bind(
          new go.Binding("background", "isHighlighted", (h) =>
            h ? "rgba(255,0,0,0.2)" : "transparent"
          ).ofObject()
        )
        .add(
          new go.Shape("Rectangle", {
            stroke: defaultColor(false),
            fill: defaultColor(false),
            strokeWidth: 2,
          })
            .bind("stroke", "horiz", defaultColor)
            .bind("fill", "horiz", defaultColor)
        )
        .add(
          new go.Panel("Vertical")
            .add(
              new go.Panel("Horizontal", {
                stretch: go.GraphObject.Horizontal,
                background: defaultColor(false),
              })
                .bind("background", "horiz", defaultColor)
                .add(
                  go.GraphObject.make("SubGraphExpanderButton", {
                    alignment: go.Spot.Right,
                    margin: 5,
                  })
                )
                .add(
                  new go.TextBlock({
                    alignment: go.Spot.Left,
                    editable: true,
                    margin: 5,
                    font: defaultFont(false),
                    opacity: 0.95,
                    stroke: "#404040",
                  })
                    .bind("font", "horiz", defaultFont)
                    .bind("text", "text", null, null)
                )
            )
            .add(new go.Placeholder({ padding: 5, alignment: go.Spot.TopLeft }))
        );

      // Node Template
      myDiagram.current.nodeTemplate = new go.Node(go.Panel.Auto, {
        mouseDrop: (e: go.InputEvent, node: go.GraphObject) =>
          // @ts-ignore
          finishDrop(e, node.containingGroup),
      })
        .add(
          new go.Shape("RoundedRectangle", {
            fill: "rgba(172, 230, 0, 0.9)",
            stroke: "white",
            strokeWidth: 0.5,
          })
        )
        .add(
          new go.TextBlock({
            margin: 7,
            editable: true,
            font: "bold 13px sans-serif",
            opacity: 0.9,
          }).bind("text", "text", null, null)
        );

      // palette
      const myPallete = new go.Palette(paletteDivRef.current, {
        nodeTemplateMap: myDiagram.current.nodeTemplateMap,
        groupTemplateMap: myDiagram.current.groupTemplateMap,
      });

      myPallete.model = new go.GraphLinksModel([
        { text: "New Node", color: "#ACE600" },
        { isGroup: true, text: "H Group", horiz: true },
        { isGroup: true, text: "V Group", horiz: false },
      ]);

      myDiagram.current.addModelChangedListener((e) => {
        // @Elliott this is where the callback is called when the diagram is changed
        if (e.isTransactionFinished) {
          // @Elliott this is where you would emit the model to the server
          // @Elliott incrementalJSON is used to only send the changes and not the entire model
          // @Elliott on the other clients, you would apply the incrementalJSON to the model
          setModelJson(e?.model?.toIncrementalJson(e) || "");
          socket.emit("modelChange", e?.model?.toIncrementalJson(e) || "");
        }
      });

      myDiagram.current.model = go.Model.fromJson(modelJson);
    };

    // Initialize the diagram
    init();
  }, [modelJson, setModelJson]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div
        id="myPaletteDiv"
        ref={paletteDivRef}
        style={{
          width: "200px",
          marginRight: "2px",
          backgroundColor: "rgb(40, 44, 52)",
          position: "relative",
        }}
      ></div>
      <div
        id="myDiagramDiv"
        ref={diagramDivRef}
        style={{
          flexGrow: 1,
          height: "750px",
          backgroundColor: "rgb(40, 44, 52)",
          position: "relative",
          cursor: "auto",
        }}
      ></div>
    </div>
  );
};

export default FlowchartDiagram;
