import { readTasks, writeTasks } from "@/lib/storage";
import { Task } from "@/lib/types";

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await context.params;
  try {
    const allTasks: Task[] = await readTasks();

    if (!allTasks || allTasks.length === 0) {
        return Response.json({error: "Requested task is missing"}, {status: 400});
    }

    const filteredTasks = allTasks.filter(el => el.id !== id);
    if (filteredTasks.length === allTasks.length) {
        return Response.json({error: "Requested task is missing"}, {status: 400});
    }
    await writeTasks(filteredTasks);

    return Response.json({"message": "Task removed successfully"}, {status: 200});

  } catch (error) {

    return Response.json({error: "Error occurred while deleting the task"}, {status: 500});
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/tasks/[id]">
) {
  const { id } = await context.params;
  const body: { completed: boolean } = await request.json();
  try {
    const allTasks: Task[] = await readTasks();

    if (!allTasks || allTasks.length === 0) {
        return Response.json({error: "Requested task is missing"}, {status: 400});
    }
    const targetTaskIndex = allTasks.findIndex(el => el.id === id)
    if (targetTaskIndex === -1) {
        return Response.json({error: "Requested task is missing"}, {status: 400});
    }

    const updatedTaskList = allTasks.map(el => {
        return el.id === id ? {...el, completed: body.completed} : el;
    })

    await writeTasks(updatedTaskList);

    return Response.json(updatedTaskList[targetTaskIndex], {status: 200});

  } catch (error) {
    return Response.json({error: "Error occurred while deleting the task"}, {status: 500});
  }
}