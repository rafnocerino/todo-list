"use client";
import { Task } from "@/lib/types";
import { TaskList } from "@/components/TaskList";
import { useEffect, useState } from "react";

export default function Home() {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect( () => {
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
        console.error("Error while retrieving tasks", {error});
      } finally {
        setIsLoading(false);
      }
      
    }
    loadTasks();
  }, [])

  async function handleToggle(id: string) {
    const task = tasks.find(t => t.id === id);
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
      setTasks(tasks.map(el => el.id === id ? updatedTask : el));

    } catch (error) {
      console.error("Error while toggling task", { error });
    }
  }

  async function handleAddTask(event : React.FormEvent<HTMLFormElement>) {
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
      console.error("Error while adding task", {error});
    }

    setNewTitle("");
  }

  async function handleDeleteTask(id: string) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

      if (!res.ok) {
        console.error("Error while deleting task");
        return;
      }

      setTasks(tasks.filter(el => el.id !== id));

    } catch (error) {
      console.error("Error while deleting task", { error });
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-1 w-full max-w-xl flex-col py-12 px-6 sm:px-0">
        <h1 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
          To-Do List
        </h1>

        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Add
          </button>
        </form>

        {isLoading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks yet — add one above.</p>
        ) : (
          <TaskList tasks={tasks} handleToggle={handleToggle} handleDelete={handleDeleteTask} />
        )}
      </main>
    </div>
  );
}
