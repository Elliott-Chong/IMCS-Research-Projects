import * as go from "gojs";
// const $ = go.GraphObject.make;

export function makeLayout(horiz: boolean) {
  // a Binding conversion function
  if (horiz) {
    return new go.GridLayout({
      wrappingWidth: Infinity,
      alignment: go.GridLayout.Position,
      cellSize: new go.Size(1, 1),
      spacing: new go.Size(4, 4),
    });
  } else {
    return new go.GridLayout({
      wrappingColumn: 1,
      alignment: go.GridLayout.Position,
      cellSize: new go.Size(1, 1),
      spacing: new go.Size(4, 4),
    });
  }
}

export function defaultColor(horiz: boolean) {
  // a Binding conversion function
  return horiz ? "rgba(255, 221, 51, 0.55)" : "rgba(51,211,229, 0.5)";
}

export function defaultFont(horiz: boolean) {
  // a Binding conversion function
  return horiz ? "bold 20px sans-serif" : "bold 16px sans-serif";
}

// this function is used to highlight a Group that the selection may be dropped into
export const highlightGroup = (
  e: go.InputEvent,
  grp: go.GraphObject,
  show: boolean
) => {
  if (!grp) return;
  e.handled = true;
  if (show) {
    if (!grp.diagram) return;
    const tool = grp.diagram.toolManager.draggingTool;
    const map = tool.draggedParts || tool.copiedParts;
    if (!map) return;
    // @ts-ignore
    if (grp.canAddMembers(map.toKeySet())) {
      // @ts-ignore
      grp.isHighlighted = true;
      return;
    }
  }
  // @ts-ignore
  grp.isHighlighted = false;
};
