import { getAllTasks, insertTask } from "@/lib/storage";
import { MAX_TITLE_LENGTH, Task } from "@/lib/types";

export async function GET() {
  try {
    const tasks = getAllTasks();
    return Response.json(tasks);
  } catch (error) {
    // it could be useful to also log the error on file (avoived for brevity)
    return Response.json({ error: "An error occured while fetching tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: { title?: string } = await request.json();
    const title = body?.title?.trim();
    if (!title) {
      return Response.json({ error: "Invalid task format" }, { status: 400 });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return Response.json(
        { error: `Title must be at most ${MAX_TITLE_LENGTH} characters` },
        { status: 400 },
      );
    }

    const task: Task = {
      title,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    insertTask(task);

    return Response.json(task, { status: 201 });
  } catch (error) {
    // it could be useful to also log the error on file (avoived for brevity)
    return Response.json({ error: "An error occured while writing tasks" }, { status: 500 });
  }
}
