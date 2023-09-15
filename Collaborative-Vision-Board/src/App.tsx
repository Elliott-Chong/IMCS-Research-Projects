import { Toaster } from "react-hot-toast";
import TaskList from "./components/TaskList";

function App() {
  return (
    <div className="py-20 mx-auto max-w-7xl">
      <h1 className="text-xl">Collaborative Vision Board</h1>
      <TaskList />
      <Toaster />
    </div>
  );
}

export default App;
