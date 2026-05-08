"use client"

import { Fragment, useEffect, useState } from "react";
import { Button } from '@/components/ui/button';
import AddTaskDialog from '@/components/add-task-dialog';
import { CircleCheck, Circle, CirclePlus } from 'lucide-react';
import { updateTodo } from "@/lib/actions/todo";
import { useTransition } from "react";
import TaskDetailDialog from "./task-detail-dialog";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { formatDate, formatDateLocal, getStartOfWeek } from "@/lib/utils/date";

export default function UpcomingClient({ groupedTodos }: { groupedTodos: Record<string, any[]> }) {
    const [localTodos, setLocalTodos] = useState(groupedTodos);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedAddDate, setSelectedAddDate] = useState<Date | null>(null);

    const searchParams = useSearchParams();
    const startParam = searchParams.get("start");

    const currentDate = useMemo(() => {
        return startParam
            ? new Date(startParam + "T00:00:00")
            : new Date();
    }, [startParam]);

    const startDate = useMemo(() => {
        return getStartOfWeek(currentDate);
    }, [currentDate]);

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            
            return d;
        });
    }, [startDate]);

    function goNextWeek() {
        const nextWeekStart = new Date(startDate);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);

        router.push(`/upcoming?start=${formatDateLocal(nextWeekStart)}`);
    }

    function goPrevWeek() {
        const prevWeekStart = new Date(startDate);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);

        router.push(`/upcoming?start=${formatDateLocal(prevWeekStart)}`);
    }

    function goToMonth(monthIndex: number) {
        const d = new Date(currentDate);
        d.setMonth(monthIndex);

        const start = getStartOfWeek(d);

        router.push(`/upcoming?start=${formatDateLocal(start)}`);
    }
    
    const router = useRouter();

    useEffect(() => {
        function scheduleRefresh() {
            const now = new Date();

            const msUntilMidnight =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 1
                ).getTime() - now.getTime();

            const timer = setTimeout(() => {
                router.refresh();
                scheduleRefresh(); 
            }, msUntilMidnight);

            return timer;
        }

        const timer = scheduleRefresh();

        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        setLocalTodos(groupedTodos);
    }, [groupedTodos]);

    function isToday(dateStr: string) {
        const today = new Date();
        const d = new Date(dateStr);

        return (
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
        );
    }

    function handleToggleComplete(todo: any) {
        setLocalTodos(prev => {
            const updated = { ...prev };

            for (const date in updated) {
                updated[date] = updated[date].map(t => 
                    t._id === todo._id
                        ? { ...t, completed: !t.completed }
                        : t
                )
            }

            return updated;
        })

        startTransition(() => {
            updateTodo(
                todo._id, { completed: !todo.completed }
            );
        });
    }

    const handleDetailsOpen = (todo: any) => {
        setSelectedTodo(todo);
        requestAnimationFrame(() => {
            setIsDetailsOpen(true);
        });
    };

    const isCurrentWeek = (() => {
        const today = new Date();
        const startOfCurrentWeek = getStartOfWeek(today);

        return startOfCurrentWeek.toDateString() === startDate.toDateString();
    })
     
    return (
        <div className="min-h-screen bg-white pt-6 md:pt-6 sm:mt-2">
            <div className="w-full px-4 sm:px-6">
                <div className="w-full max-w-3xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-black mb-6">Upcoming</h1>

                        <div className="flex flex-col gap-4 mb-6">

                            {/* Top Bar */}
                            <div className="flex items-center justify-end w-full">

                                {/* Month Dropdown */}
                                {/* <div className="flex items-center justify-between">
                                    <select
                                        onChange={(e) => goToMonth(Number(e.target.value))}
                                        className="border rounded px-2 py-1 text-sm"
                                        value={currentDate.getMonth()}
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i} value={i}>
                                                {new Date(0, i).toLocaleString("en-GB", { month: "long" })}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}
                                
                                <div className="flex gap-4">
                                    {/* Left Arrow */}
                                    <button
                                        onClick={goPrevWeek}
                                        disabled={isCurrentWeek()}
                                        className={`p-2 rounded hover:bg-gray-100
                                                    ${
                                                        isCurrentWeek()
                                                            ? "opacity-30 cursor-not-allowed"
                                                            : "hover:bg-gray-100 cursor-pointer"
                                                    }
                                        `}
                                    >
                                        <ChevronLeft className="w-5 h-5 cursor-pointer" />
                                    </button>


                                    {/* Right Arrow */}
                                    <button
                                        onClick={goNextWeek}
                                        className="p-2 rounded hover:bg-gray-100"
                                    >
                                        <ChevronRight className="w-5 h-5 cursor-pointer" />
                                    </button>
                                </div>
                            </div>

                            {/* 7-Day Strip */}
                            <div className="flex gap-2 sm:gap-6">

                                {days.map((day) => {
                                    const isToday = day.toDateString() === new Date().toDateString();

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => {
                                                const start = getStartOfWeek(day);
                                                router.push(`/upcoming?start=${formatDateLocal(start)}`)
                                            }}
                                            className={`flex flex-col gap-3 items-center p-2 rounded-md w-full transition ${
                                                isToday ? "text-black font-bold" : "text-gray-500"
                                            }`}
                                        >
                                            <span className="text-xs">
                                                {day.toLocaleDateString("en-GB", { weekday: "short" })}
                                            </span>

                                            <span className="text-sm font-medium">
                                                {day.getDate()}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Divider line */}
                            <div className="border-b-2 border-gray-300 mt-2 mb-6 w-full"></div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="mb-6 mt-6">

                        {/* Tasks list */}
                        <div className="space-y-3">
                            {Object.entries(localTodos)
                                .filter(([date]) => !isToday(date))
                                .map(([date, todos]) => (
                                    <Fragment key={date}>
                                        <div className="mb-10">
                                            {/* Date heading */}
                                            <h2 className="text-xl font-semibold text-black mb-2">
                                                {formatDate(date)}
                                            </h2>
                                            
                                            {/* Divider line */}
                                            <div className="border-b-2 border-black mt-2 mb-6 w-full"></div>

                                            <div className="space-y-3">
                                                {todos.map((todo: any) => (
                                                    <div
                                                        key={todo._id}
                                                        onClick={() => handleDetailsOpen(todo)}
                                                        className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 rounded px-2 py-1"
                                                    >
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleComplete(todo);
                                                            }}
                                                            className={`w-6 h-6 flex items-center justify-center ${
                                                                isPending ? "opacity-50 pointer-events-none" : "cursor-pointer"
                                                            }`}
                                                        >
                                                            {todo.completed ? (
                                                                <CircleCheck className="w-6 h-6 text-green-500" />
                                                                ) : (
                                                                <Circle className="w-6 h-6 text-gray-400 group-hover:scale-110" />
                                                                )
                                                            }
                                                        </div>

                                                        <p
                                                            className={`transition-all duration-300 ${
                                                            todo.completed
                                                                ? "line-through text-gray-400"
                                                                : "text-gray-700"
                                                            }`}
                                                        >
                                                            {todo.title}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* <Button 
                                                variant="ghost"
                                                onClick={() => {
                                                    setSelectedAddDate(new Date(date));
                                                    setIsAddTaskOpen(true);
                                                }}
                                                // className="mt-3 text-red-500 font-semibold justify-start w-full cursor-pointer mb-8"
                                                className="mt-3 text-red-500 font-medium flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded cursor-pointer"   
                                            >
                                                <CirclePlus size={18} />
                                                <span>Add task</span>
                                            </Button> */}

                                            <div className="mt-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAddDate(new Date(date));
                                                        setIsAddTaskOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 text-red-500 text-sm font-medium hover:bg-gray-50 px-2 py-1 rounded-md"
                                                >
                                                    <CirclePlus size={18} />
                                                    Add task
                                                </button>
                                            </div>
                                            
                                        </div>
                                        
                                    </Fragment>
                            ))} 
                        </div>
                    </div>

                    <div className="mb-6">
                        <AddTaskDialog 
                            open={isAddTaskOpen} 
                            onOpenChange={setIsAddTaskOpen}
                            defaultDate={selectedAddDate}
                            onUpdate={(newTodo) => {
                                const key = new Date(newTodo.dueDate).toISOString().split("T")[0];

                                setLocalTodos(prev => ({
                                    ...prev,
                                    [key]: [newTodo, ...(prev[key] || [])]
                                }));
                            }}
                        />

                        <TaskDetailDialog
                            todo={selectedTodo}
                            open={isDetailsOpen}
                            onOpenChange={setIsDetailsOpen}
                            onUpdate={(updatedTodo) => {
                                setLocalTodos(prev => 
                                    Object.fromEntries(
                                        Object.entries(prev).map(([date, todos]) => [
                                            date,
                                            todos.map(t =>
                                                t._id === updatedTodo._id ? updatedTodo : t
                                            )
                                        ])
                                    )
                                )}
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}