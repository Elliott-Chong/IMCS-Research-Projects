import React from "react";
import TaskColumn from "./TaskColumn";
import {
  DragDropContext,
  DropResult,
  Droppable,
  OnDragEndResponder,
} from "react-beautiful-dnd";
import { socket } from "../lib/socket";
import toast from "react-hot-toast";

export type Task = {
  name: string;
  description: string;
  status: "Done" | "In Progress" | "To Do";
  id: number;
};

type status = "Done" | "In Progress" | "To Do";

const TaskList = () => {
  const [tasks, setTasks] = React.useState<Record<status, Task[]>>({
    Done: [
      {
        id: 2,
        name: "Set the Table",
        description: "Prepare plates",
        status: "Done",
      },
    ],
    "In Progress": [
      {
        id: 1,
        name: "Finish Cooking",
        description: "Let Him COOK",
        status: "In Progress",
      },
    ],
    "To Do": [
      {
        id: 3,
        name: "Buy Tomatoes",
        description: "Go to the supermarket",
        status: "To Do",
      },
      {
        id: 4,
        name: "Hire a Chef",
        description: "Hire Someone",
        status: "To Do",
      },
    ],
  });

  React.useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      toast.success("Connected to server");
    });

    socket.on("drag", (newTasks) => {
      // @Elliott here is where we handle the drag event from other clients
      // @Elliott we need to update the state of the tasks here
      setTasks(newTasks);
    });
  }, []);

  const handleDrop = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    const start = tasks[source.droppableId as status];
    const finish = tasks[destination.droppableId as status];
    if (start === finish) {
      const newTasks = Array.from(start);
      newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, start[source.index]);
      const newTaskList = { ...tasks, [source.droppableId]: newTasks };
      setTasks(newTaskList);
      return;
    }
    const startTasks = Array.from(start);
    startTasks.splice(source.index, 1);
    const newStart = { ...tasks, [source.droppableId]: startTasks };
    const finishTasks = Array.from(finish);
    finishTasks.splice(destination.index, 0, start[source.index]);
    const newFinish = { ...newStart, [destination.droppableId]: finishTasks };
    const newTasks = { ...tasks, ...newStart, ...newFinish };
    setTasks(newTasks);
    return newTasks;
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    // @Elliott we need to update the state of the tasks here
    // @Elliott we also need to send this to the websocket server to propagate the change to all the clients
    const newTasks = handleDrop(result);
    if (!newTasks) return;
    // @Elliott once we recalculate the new tasks, we need to send them to the websocket server
    socket.emit("drag", newTasks);
  };

  return (
    // @Elliott Refer to the following link for more information on DragDropContext:
    // https://github.com/atlassian/react-beautiful-dnd
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-8 pt-4 rounded-tl-none rounded-xl md:grid-cols-3 ">
        {/* Todo */}
        <div className="flex flex-col gap-3 p-3 shadow-md rounded-xl bg-base-100 outline outline-1 outline-slate-400">
          <div className="flex items-center gap-1 px-2 text-xl font-bold">
            <div>To Do</div>
          </div>
          <Droppable droppableId="To Do">
            {(provided) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  <TaskColumn tasks={tasks["To Do"]} />
                </div>
                {provided.placeholder}
              </>
            )}
          </Droppable>
        </div>

        {/* In Progress */}
        <div className="flex flex-col gap-3 p-3 shadow-md rounded-xl bg-base-100 outline outline-1 outline-slate-400">
          <div className="flex items-center gap-1 px-2 text-xl font-bold">
            <div>In Progress</div>
          </div>
          <Droppable droppableId="In Progress">
            {(provided) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  <TaskColumn tasks={tasks["In Progress"]} />
                </div>
                {provided.placeholder}
              </>
            )}
          </Droppable>
        </div>

        {/* Done */}
        <div className="flex flex-col gap-3 p-3 shadow-md rounded-xl bg-base-100 outline outline-1 outline-slate-400">
          <div className="flex items-center gap-1 px-2 text-xl font-bold">
            <div>Done</div>
          </div>
          <Droppable droppableId="Done">
            {(provided) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-4"
                >
                  <TaskColumn tasks={tasks["Done"]} />
                </div>
                {provided.placeholder}
              </>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskList;
