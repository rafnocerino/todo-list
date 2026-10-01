import { deleteTask, updateTask } from "@/lib/storage";
import { MAX_TITLE_LENGTH } from "@/lib/types";

export async function DELETE(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  const { id } = await context.params;
  try {
    const removed = deleteTask(id);
    if (!removed) {
      return Response.json({ error: "Requested task is missing" }, { status: 404 });
    }

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

    const updated = updateTask(id, {
      ...(body.completed !== undefined ? { completed: body.completed } : {}),
      ...(title !== undefined ? { title } : {}),
    });

    if (!updated) {
      return Response.json({ error: "Requested task is missing" }, { status: 404 });
    }

    return Response.json(updated, { status: 200 });
  } catch (error) {
    // it could be useful to also log the error on file (avoived for brevity)
    return Response.json({ error: "Error occurred while updating the task" }, { status: 500 });
  }
}
