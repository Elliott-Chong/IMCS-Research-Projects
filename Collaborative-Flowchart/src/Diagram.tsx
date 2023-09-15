import React, { useEffect, useRef } from "react";
import go, { DiagramEvent } from "gojs";
import { makePort, nodeStyle, textStyle } from "./goUtils";
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
        LinkDrawn: showLinkLabel,
        "undoManager.isEnabled": true,
      });

      // Define node and link templates
      // Example node template:
      myDiagram.current.nodeTemplateMap.add(
        "", // the default category
        $(
          go.Node,
          "Table",
          nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(
            go.Panel,
            "Auto",
            $(
              go.Shape,
              "Rectangle",
              { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
              new go.Binding("figure", "figure")
            ),
            $(
              go.TextBlock,
              textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true,
              },
              new go.Binding("text").makeTwoWay()
            )
          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
          makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
          makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
      );

      // Define your other node templates here
      myDiagram.current.nodeTemplateMap.add(
        "Conditional",
        $(
          go.Node,
          "Table",
          nodeStyle(),
          // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
          $(
            go.Panel,
            "Auto",
            $(
              go.Shape,
              "Diamond",
              { fill: "#282c34", stroke: "#00A9C9", strokeWidth: 3.5 },
              new go.Binding("figure", "figure")
            ),
            $(
              go.TextBlock,
              textStyle(),
              {
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                editable: true,
              },
              new go.Binding("text").makeTwoWay()
            )
          ),
          // four named ports, one on each side:
          makePort("T", go.Spot.Top, go.Spot.Top, false, true),
          makePort("L", go.Spot.Left, go.Spot.Left, true, true),
          makePort("R", go.Spot.Right, go.Spot.Right, true, true),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        )
      );

      myDiagram.current.nodeTemplateMap.add(
        "Start",
        $(
          go.Node,
          "Table",
          nodeStyle(),
          $(
            go.Panel,
            "Spot",
            $(go.Shape, "Circle", {
              desiredSize: new go.Size(70, 70),
              fill: "#282c34",
              stroke: "#09d3ac",
              strokeWidth: 3.5,
            }),
            $(go.TextBlock, "Start", textStyle(), new go.Binding("text"))
          ),
          // three named ports, one on each side except the top, all output only:
          makePort("L", go.Spot.Left, go.Spot.Left, true, false),
          makePort("R", go.Spot.Right, go.Spot.Right, true, false),
          makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        )
      );

      myDiagram.current.nodeTemplateMap.add(
        "End",
        $(
          go.Node,
          "Table",
          nodeStyle(),
          $(
            go.Panel,
            "Spot",
            $(go.Shape, "Circle", {
              desiredSize: new go.Size(60, 60),
              fill: "#282c34",
              stroke: "#DC3C00",
              strokeWidth: 3.5,
            }),
            $(go.TextBlock, "End", textStyle(), new go.Binding("text"))
          ),
          // three named ports, one on each side except the bottom, all input only:
          makePort("T", go.Spot.Top, go.Spot.Top, false, true),
          makePort("L", go.Spot.Left, go.Spot.Left, false, true),
          makePort("R", go.Spot.Right, go.Spot.Right, false, true)
        )
      );
      go.Shape.defineFigureGenerator("File", (shape, w, h) => {
        var geo = new go.Geometry();
        var fig = new go.PathFigure(0, 0, true); // starting point
        geo.add(fig);
        fig.add(new go.PathSegment(go.PathSegment.Line, 0.75 * w, 0));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, 0.25 * h));
        fig.add(new go.PathSegment(go.PathSegment.Line, w, h));
        fig.add(new go.PathSegment(go.PathSegment.Line, 0, h).close());
        var fig2 = new go.PathFigure(0.75 * w, 0, false);
        geo.add(fig2);
        // The Fold
        fig2.add(new go.PathSegment(go.PathSegment.Line, 0.75 * w, 0.25 * h));
        fig2.add(new go.PathSegment(go.PathSegment.Line, w, 0.25 * h));
        geo.spot1 = new go.Spot(0, 0.25);
        geo.spot2 = go.Spot.BottomRight;
        return geo;
      });
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

      myDiagram.current.nodeTemplateMap.add(
        "Comment",
        $(
          go.Node,
          "Auto",
          nodeStyle(),
          $(go.Shape, "File", {
            fill: "#282c34",
            stroke: "#DEE0A3",
            strokeWidth: 3,
          }),
          $(
            go.TextBlock,
            textStyle(),
            {
              margin: 8,
              maxSize: new go.Size(200, NaN),
              wrap: go.TextBlock.WrapFit,
              textAlign: "center",
              editable: true,
            },
            new go.Binding("text").makeTwoWay()
          )
          // no ports, because no links are allowed to connect with a comment
        )
      );

      myDiagram.current.linkTemplate = $(
        go.Link, // the whole link panel
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpOver,
          corner: 5,
          toShortLength: 4,
          relinkableFrom: true,
          relinkableTo: true,
          reshapable: true,
          resegmentable: true,
          // mouse-overs subtly highlight links:
          mouseEnter: (e, link) =>
            //   @ts-ignore
            (link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"),
          mouseLeave: (e, link) =>
            //   @ts-ignore
            (link.findObject("HIGHLIGHT").stroke = "transparent"),
          selectionAdorned: false,
        },
        new go.Binding("points").makeTwoWay(),
        $(
          go.Shape, // the highlight shape, normally transparent
          {
            isPanelMain: true,
            strokeWidth: 8,
            stroke: "transparent",
            name: "HIGHLIGHT",
          }
        ),
        $(
          go.Shape, // the link path shape
          { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
          new go.Binding("stroke", "isSelected", (sel) =>
            sel ? "dodgerblue" : "gray"
          ).ofObject()
        ),
        $(
          go.Shape, // the arrowhead
          { toArrow: "standard", strokeWidth: 0, fill: "gray" }
        ),
        $(
          go.Panel,
          "Auto", // the link label, normally not visible
          {
            visible: false,
            name: "LABEL",
            segmentIndex: 2,
            segmentFraction: 0.5,
          },
          new go.Binding("visible", "visible").makeTwoWay(),
          $(
            go.Shape,
            "RoundedRectangle", // the label shape
            { fill: "#F8F8F8", strokeWidth: 0 }
          ),
          $(
            go.TextBlock,
            "Yes", // the label
            {
              textAlign: "center",
              font: "10pt helvetica, arial, sans-serif",
              stroke: "#333333",
              editable: true,
            },
            new go.Binding("text").makeTwoWay()
          )
        )
      );

      myDiagram.current.model = go.Model.fromJson(modelJson);

      function showLinkLabel(e: any) {
        var label = e.subject.findObject("LABEL");
        if (label !== null)
          label.visible = e.subject.fromNode.data.category === "Conditional";
      }

      // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
      myDiagram.current.toolManager.linkingTool.temporaryLink.routing =
        go.Link.Orthogonal;
      myDiagram.current.toolManager.relinkingTool.temporaryLink.routing =
        go.Link.Orthogonal;

      // Define the save, load, and print functions
      new go.Palette(
        "myPaletteDiv", // must name or refer to the DIV HTML element
        {
          // Instead of the default animation, use a custom fade-down
          //   @ts-ignore
          "animationManager.initialAnimationStyle": go.AnimationManager.None,
          InitialAnimationStarting: animateFadeDown, // Instead, animate with this function

          nodeTemplateMap: myDiagram.current.nodeTemplateMap, // share the templates used by myDiagram
          model: new go.GraphLinksModel([
            // specify the contents of the Palette
            { category: "Start", text: "Start" },
            { text: "Step" },
            { category: "Conditional", text: "???" },
            { category: "End", text: "End" },
            { category: "Comment", text: "Comment" },
          ]),
        }
      );
      // This is a re-implementation of the default animation, except it fades in from downwards, instead of upwards.
      function animateFadeDown(e: DiagramEvent) {
        var diagram = e.diagram;
        var animation = new go.Animation();
        animation.isViewportUnconstrained = true; // So Diagram positioning rules let the animation start off-screen
        animation.easing = go.Animation.EaseOutExpo;
        animation.duration = 900;
        // Fade "down", in other words, fade in from above
        animation.add(
          diagram,
          "position",
          diagram.position.copy().offset(0, 200),
          diagram.position
        );
        animation.add(diagram, "opacity", 0, 1);
        animation.start();
      }
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
          width: "100px",
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
