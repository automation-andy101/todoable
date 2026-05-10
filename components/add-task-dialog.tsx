import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { createTodo } from "@/lib/actions/todo";
import { toast } from "react-toastify";

export default function AddTaskDialog({
    open,
    onOpenChange,
    defaultDate,
    onUpdate
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void;
    defaultDate?: Date | null;
    onUpdate?: (newTodo: any) => void;
}) {

    const [priority, setPriority] = useState(4);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [dueDate, setDueDate] = useState<Date | undefined>(defaultDate ?? new Date());

    const priorities = [
        { value: 1, label: "Priority 1", color: "text-red-500" },
        { value: 2, label: "Priority 2", color: "text-orange-500" },
        { value: 3, label: "Priority 3", color: "text-blue-500" },
        { value: 4, label: "Priority 4", color: "text-gray-500" },
    ];

    const selectedPriority = priorities.find((p) => p.value === priority);

    useEffect(() => {
        if (open) {
            setDueDate(defaultDate ?? new Date());
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg w-full rounded-2xl p-4 sm:p-6">
                <form
                    action={async (formData) => {
                        try {
                            const todo = await createTodo(formData);

                            if (onUpdate) {
                                onUpdate(todo);
                            }

                            toast.success("Task added successfully ✅");

                            onOpenChange(false);
                        } catch (err) {
                            toast.error("Failed to add task ❌");
                        }
                    }}
                >
                    <DialogHeader className="mb-6">
                        <DialogTitle>New Task</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2 mb-4">
                        <Input 
                            id="title" 
                            name="title" 
                            placeholder="Task name"
                            className="border-0 shadow-none text-base px-0 focus-visible:ring-0"
                            autoFocus 
                        />
                    </div>
                    <div className="space-y-2 mb-4">
                        <Textarea 
                            id="description" 
                            name="description" 
                            placeholder="Add details..." 
                            className="resize-none border-0 shadow-none px-0 focus-visible:ring-0 min-h-[80px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-4 flex-wrap">

                        {/* Mobile native picker */}
                        <div className="sm:hidden">
                            <input
                                type="date"
                                value={
                                    dueDate
                                        ? dueDate.toISOString().split("T")[0]
                                        : ""
                                }
                                onChange={(e) => {
                                    setDueDate(new Date(e.target.value));
                                }}
                                className="
                                    border rounded-full px-3 py-2 text-sm
                                    bg-white
                                "
                            />
                        </div>

                        {/* Desktop calendar popover */}
                        <div className="hidden sm:block">
                            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full text-sm"
                                    >
                                        Due: {
                                            dueDate
                                                ? dueDate.toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short"
                                                })
                                                : "Today"
                                        }
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                    side="top"
                                    align="start"
                                    sideOffset={8}
                                    avoidCollisions={false}
                                    className="
                                        w-auto p-0
                                        max-w-[calc(100vw-2rem)]
                                    "
                                >
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setDueDate(date);
                                                setIsDateOpen(false);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Priority */}
                        <Popover open={isPriorityOpen} onOpenChange={setIsPriorityOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={`rounded-full text-sm ${selectedPriority?.color}`}
                                >
                                    Priority {priority}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-48 p-1">
                                <div className="flex flex-col">
                                    {priorities.map((p) => (
                                        <button
                                            type="button"
                                            key={p.value}
                                            onClick={() => {
                                                setPriority(p.value)
                                                setIsPriorityOpen(false)
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 ${p.color}`}
                                        >
                                            <span>{p.label}</span>

                                            {priority === p.value && (
                                                <span className="text-xs">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                            
                            <input type="hidden" name="priority" value={priority} />

                            <input
                                type="hidden"
                                name="dueDate"
                                value={dueDate ? dueDate.toISOString() : ""}
                            />
                        </Popover>
                    </div>

                    <DialogFooter className="mt-6 flex-row justify-end gap-2">
                        <Button
                            type="button"
                            className="cursor-pointer" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit"
                            className="bg-red-500 hover:bg-red-600 w-full sm:w-auto cursor-pointer"
                        >
                            Add Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>  
        </Dialog>
    )
}

