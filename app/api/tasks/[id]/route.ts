import { readTasks, writeTasks } from "@/lib/storage";
import { MAX_TITLE_LENGTH, Task } from "@/lib/types";

export async function DELETE(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const { id } = await context.params;
  try {
    const allTasks: Task[] = await readTasks();

    const filteredTasks = allTasks.filter((el) => el.id !== id);
    if (filteredTasks.length === allTasks.length) {
      return Response.json({ error: "Requested task is missing" }, { status: 404 });
    }
    await writeTasks(filteredTasks);

    return Response.json({ message: "Task removed successfully" }, { status: 200 });
  } catch (error) {
    // it could be useful to also log the error on file (avoived for brevity)
    return Response.json({ error: "Error occurred while deleting the task" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const { id } = await context.params;

  try {
    const body: { completed?: boolean; title?: string } = await request.json();

    if (body.completed === undefined && body.title === undefined) {
      return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const title = body.title !== undefined ? body.title.trim() : undefined;
    if (title !== undefined && !title) {
      return Response.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (title !== undefined && title.length > MAX_TITLE_LENGTH) {
      return Response.json(
        { error: `Title must be at most ${MAX_TITLE_LENGTH} characters` },
        { status: 400 },
      );
    }

    const allTasks: Task[] = await readTasks();

    const targetTaskIndex = allTasks.findIndex((el) => el.id === id);
    if (targetTaskIndex === -1) {
      return Response.json({ error: "Requested task is missing" }, { status: 404 });
    }

    const updatedTaskList = allTasks.map((el) => {
      if (el.id !== id) return el;
      return {
        ...el,
        ...(body.completed !== undefined ? { completed: body.completed } : {}),
        ...(title !== undefined ? { title } : {}),
      };
    });

    await writeTasks(updatedTaskList);

    return Response.json(updatedTaskList[targetTaskIndex], { status: 200 });
  } catch (error) {
    // it could be useful to also log the error on file (avoived for brevity)
    return Response.json({ error: "Error occurred while updating the task" }, { status: 500 });
  }
}
