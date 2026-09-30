import { Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

export function TaskList({tasks, handleToggle, handleDelete}: {tasks: Task[], handleToggle: (id: string) => void, handleDelete: (id: string) => void}) {
    return (
        <ul className="flex flex-col gap-2.5">
            {tasks.map((el) => (
                <TaskItem key={el.id} task={el} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
        </ul>
    );
}
