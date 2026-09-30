"use client";
import { Task } from "@/lib/types";
import { TaskList } from "@/components/TaskList";
import { TaskListSkeleton } from "@/components/TaskListSkeleton";
import { useEffect, useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");

        if (!res.ok) {
          console.error("Error while retrieving tasks");
          return;
        }

        const data: Task[] = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error while retrieving tasks", { error });
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

  async function handleToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!res.ok) {
        console.error("Error while toggling task");
        return;
      }

      const updatedTask: Task = await res.json();
      setTasks(tasks.map((el) => (el.id === id ? updatedTask : el)));
    } catch (error) {
      console.error("Error while toggling task", { error });
    }
  }

  async function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newTitle.trim()) {
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) {
        console.error("Error while adding task");
        return;
      }

      const createdTask: Task = await res.json();
      setTasks([...tasks, createdTask]);
    } catch (error) {
      console.error("Error while adding task", { error });
    }

    setNewTitle("");
  }

  async function handleEditTitle(id: string, title: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        console.error("Error while editing task");
        return;
      }

      const updatedTask: Task = await res.json();
      setTasks(tasks.map((el) => (el.id === id ? updatedTask : el)));
    } catch (error) {
      console.error("Error while editing task", { error });
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

      if (!res.ok) {
        console.error("Error while deleting task");
        return;
      }

      setTasks(tasks.filter((el) => el.id !== id));
    } catch (error) {
      console.error("Error while deleting task", { error });
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-stone-200 px-4 py-10 dark:bg-stone-950 sm:py-16">
      <main className="w-full max-w-xl rounded-2xl bg-teal-50 p-5 ring-1 ring-teal-900/5 dark:bg-stone-900 dark:ring-teal-50/5 sm:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-teal-950 dark:text-teal-50">To-Do List</h1>
          <span className="rounded-full bg-teal-700/10 px-2.5 py-1 font-mono text-xs text-teal-800 dark:bg-teal-400/10 dark:text-teal-300">
            {tasks.filter((t) => !t.completed).length} open
          </span>
        </div>

        <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-lg border border-teal-900/15 bg-white px-3 py-2 text-sm text-teal-950 placeholder:text-teal-900/40 focus:outline-none focus:ring-2 focus:ring-teal-600 dark:border-teal-50/15 dark:bg-stone-800 dark:text-teal-50 dark:placeholder:text-teal-50/30 dark:focus:ring-teal-400"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:bg-teal-500 dark:text-teal-950 dark:hover:bg-teal-400"
          >
            Add
          </button>
        </form>

        {isLoading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          <p className="text-sm text-teal-900/50 dark:text-teal-50/40">
            No tasks yet — add one above.
          </p>
        ) : (
          <TaskList
            tasks={tasks}
            handleToggle={handleToggle}
            handleDelete={handleDeleteTask}
            handleEdit={handleEditTitle}
          />
        )}
      </main>
    </div>
  );
}
