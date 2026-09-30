import { readTasks, writeTasks } from "@/lib/storage";
import { Task } from "@/lib/types";

export async function GET() {
    try {
        const tasks = await readTasks();
        return Response.json(tasks);
    } catch(error) {
        return Response.json({error: "An error occured while fetching tasks"}, {status: 500});
    }
  
  
}

export async function POST(request: Request) {
    try {
        const body: {title: string} = await request.json();
        if (!body?.title) {
            return Response.json({error: "Invalid task format"}, {status: 400});
        }

        const task: Task = {
            title: body.title,
            id: crypto.randomUUID(),
            completed: false,
            createdAt: new Date().toISOString()
        }

        const oldTasks: Task[] = await readTasks();
        const newTasks = [...oldTasks, task];

        await writeTasks(newTasks);
        return Response.json(task, {status: 201});

    } catch (error) {
        return Response.json({error: "An error occured while writing tasks"}, {status: 500});
    }

}
