"use server";

import { revalidatePath } from "next/cache";
import connectDB from "../db";
import { getSession } from "../auth/auth";
import Todo from "../models/Todo";

export async function createTodo(formData: FormData) {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const title = formData.get("title") as string;
    const descriptionValue = formData.get("description") as string;
    const priority = Number(formData.get("priority")) || 4;
    const dueDateValue = formData.get("dueDate") as string;

    const dueDate = dueDateValue ? new Date(dueDateValue) : undefined;
    const description = descriptionValue?.trim() ? descriptionValue : undefined;

    try {
        console.log("createTodo called");

        const title = formData.get("title");
        console.log("title:", title);

        console.log("des:", description);

        console.log("priority:", priority);

        console.log("dueDate:", dueDate);

        // your existing session logic
        console.log("session ok");

        // your db connect logic
        console.log("db connected");

        // your create logic
        console.log("creating todo");

        const todo = await Todo.create({
            title,
            description,
            priority,
            dueDate,
            completed: false,
            userId: session.user.id,
        });

        console.log("todo created:", todo);

        revalidatePath("/");

        return JSON.parse(JSON.stringify(todo));

    } catch (error) {
        console.error("CREATE TODO ERROR:");
        console.error(error);

        throw error;
    }
}

export async function getUpcomingTodos() {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const today = new Date();

    const start = new Date(today);
    start.setDate(today.getDate() + 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setDate(start.getDate() + 7)
    end.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
        userId: session.user.id,
        dueDate: {
            $gte: start,
            $lte: end
        }
    }).sort({ dueDate: 1 });

    const grouped: Record<string, any[]> = {}

    for (const todo of todos) {
        const date = todo.dueDate ? new Date(todo.dueDate) : new Date();

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(JSON.parse(JSON.stringify(todo)));
    }

    return grouped;
}

export async function searchTodos(searchTerm: string) {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const safeSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const match = {
        $regex: safeSearch,
        $options: "i"
    };

    const todos = await Todo.find({
        userId: session.user.id,
        $or: [
            { title: match },
            { description: match }
        ]
    })
    .sort({ dueDate: 1})
    .lean();

    const grouped: Record<string, any[]> = {};

    for (const todo of todos) {
        const date = todo.dueDate ? new Date(todo.dueDate) : new Date();

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
            ...todo,
            _id: todo._id.toString(),
            dueDate:todo.dueDate?.toISOString(),
            createdAt:todo.createdAt?.toISOString(),
            updatedAt:todo.updatedAt?.toISOString(),
        });
    }

    return grouped;
}

export async function getUpcomingTodosBetweenDays(startDate: Date, endDate: Date) {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
        userId: session.user.id,
        dueDate: {
            $gte: start,
            $lte: end
        }
    }).sort({ dueDate: 1 });

    const grouped: Record<string, any[]> = {};

    for (const todo of todos) {
        const date = new Date(todo.dueDate);

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(JSON.parse(JSON.stringify(todo)));
    }

    return grouped;
}

export async function getTodaysTodos() {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
        userId: session.user.id,
        dueDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    }).sort({ dueDate: 1 });

    console.log(startOfDay, endOfDay);
    console.log(JSON.parse(JSON.stringify(todos)));

    return JSON.parse(JSON.stringify(todos));
}

type TodoUpdate = {
    completed?: boolean;
    title?: string;
    description?: string;
    priority?: number;
    dueDate?: string | Date;
};

export async function updateTodo(todoId: string,  updates: TodoUpdate) {
    const session = await getSession();

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await connectDB();

    let parsedPriority: number | undefined;
    let parsedDueDate: Date | undefined;
    
    if (typeof updates.priority === "number") {
        parsedPriority = updates.priority;
    } else if (typeof updates.priority === "string") {
        const num = Number(updates.priority);
        if (!isNaN(num)) parsedPriority = num;
    }

    if (updates.dueDate instanceof Date) {
        parsedDueDate = updates.dueDate;
    } else if (typeof updates.dueDate === "string") {
        const d = new Date(updates.dueDate);
        if (!isNaN(d.getTime())) parsedDueDate = d;
    }

    const updateData: any = {};

    if (typeof updates.title === "string") {
        updateData.title = updates.title;
    }

    if (typeof updates.description === "string") {
        updateData.description = updates.description;
    }

    if (parsedDueDate !== undefined) {
        updateData.dueDate = parsedDueDate;
    }

    if (parsedPriority !== undefined) {
        updateData.priority = parsedPriority;
    }

    if (typeof updates.completed === "boolean") {
        updateData.completed = updates.completed;
    }

    const todo = await Todo.findOneAndUpdate(
        {
            _id: todoId,
            userId: session.user.id
        },
        updateData,
        { new: true } // brings back the updated todo
    );

    if (!todo) {
        return { error: "Todo not found" };
    }

    revalidatePath("/today");

    return JSON.parse(JSON.stringify(todo));
}

