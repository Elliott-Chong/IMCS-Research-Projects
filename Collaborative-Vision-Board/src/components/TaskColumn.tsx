import { Draggable } from "react-beautiful-dnd";
import { Task } from "./TaskList";
import { motion } from "framer-motion";

type Props = {
  tasks: Task[];
};

const TaskColumn = ({ tasks }: Props) => {
  return (
    <>
      {tasks.map((task, index) => {
        return (
          <Draggable
            draggableId={task.id.toString()}
            index={index}
            key={task.id}
          >
            {(provided) => (
              <motion.div layoutId={task.id.toString()} key={task.id}>
                <div
                  key={task.id}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  className="relative flex flex-col justify-center gap-2 px-3 py-2 shadow-sm cursor-pointer rounded-xl bg-base outline outline-1 outline-slate-400 hover:bg-base-200"
                >
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="font-semibold text-md">{task.name}</div>
                        <div className="relative inline-block text-left"></div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {task.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Draggable>
        );
      })}
    </>
  );
};

export default TaskColumn;
