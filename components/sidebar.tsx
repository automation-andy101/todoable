"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ListTodo, Calendar as CalendarIcon, Search, CirclePlus, PanelLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createTodo } from "@/lib/actions/todo";
import AddTaskDialog from "./add-task-dialog";
import { SearchDialog } from "./search-dialog";


export default function Sidebar({ sideNavOpen, setSideNavOpen }: { 
    sideNavOpen: boolean; 
    setSideNavOpen: (value: boolean) => void; 
}) {    
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedAddDate, setSelectedAddDate] = useState<Date | null>(null);

    const pathname = usePathname();

    const baseItemClass = "flex items-center gap-2 px-2 py-2 rounded-md text-sm";

    const linkClass = (path: string) =>
        `${baseItemClass} ${
            pathname === path
                ? "font-semibold bg-gray-100"
                : "text-gray-600 hover:bg-gray-100"
        }`;

    const { data: session } = useSession();

    const firstName = session?.user?.name?.split(" ")[0];

    return (
        <>
            {/* Overlay (mobile only) */}
            {sideNavOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 md:hidden"
                    onClick={() => setSideNavOpen(false)}
                />
            )}
            
            <aside
                className={`
                    w-64 h-dvh bg-white border-r p-4 pt-20 md:pt-4
                    fixed md:static z-40
                    transition-transform duration-300
                    flex flex-col overflow-hidden
                    ${sideNavOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                {/* MAIN NAV */}
                <nav className="flex flex-col gap-4 flex-1 overflow-y-auto">
                    <Button 
                        variant="ghost"
                        onClick={() => {
                            setSelectedAddDate(new Date())
                            setIsAddTaskOpen(true)
                        }}
                        className={`${baseItemClass} text-red-500 font-semibold justify-start w-full cursor-pointer`}    
                    >
                        <CirclePlus size={18} />
                        <span>Add task</span>
                    </Button>
                    <Link href="/today"
                        onClick={() => setSideNavOpen(false)}
                        className={`${baseItemClass} ${linkClass("/today")}`}
                    >
                        <ListTodo size={18} />
                        <span>Today</span>
                    </Link>
                    <Link href="/upcoming"
                        onClick={() => setSideNavOpen(false)}
                        className={`${baseItemClass} ${linkClass("/upcoming")}`}    
                    >
                        <CalendarIcon size={18} />
                        <span>Upcoming</span>
                    </Link>
                    <button
                        onClick={() => {
                            setIsSearchOpen(true)
                            setSideNavOpen(false)
                        }}
                        className={`${baseItemClass} ${linkClass("/search")}`}
                    >
                        <Search size={18} />
                        <span>Search</span>
                    </button>
                </nav>

                {/* ACCOUNT SECTION */}
                <div className="mt-auto border-t pt-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-2 py-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {session?.user?.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-medium">
                                            {firstName}
                                        </span>

                                        {/* <span className="text-xs text-muted-foreground">
                                            {session?.user?.email}
                                        </span> */}
                                        <span className="hidden sm:block text-xs text-muted-foreground">
                                            {session?.user?.email}
                                        </span>
                                    </div>
                                </div>

                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="start"
                            className="w-56"
                        >
                            <DropdownMenuLabel>
                                Account
                            </DropdownMenuLabel>

                            <SignOutButton />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                    {/* <div className="flex flex-row items-center justify-between pt-3 mb-4">
                        <DropdownMenu
                            onOpenChange={(open) => {
                                if (!open) {
                                setTimeout(() => {
                                    (document.activeElement as HTMLElement)?.blur();
                                }, 0);
                                }
                            }}
                        >
                            <DropdownMenuTrigger
                                className="w-full flex items-center gap-3 justify-start px-2 py-2 cursor-pointer focus-visible:ring-0 focus-visible:outline-none"
                                asChild
                            >
                                <Button
                                    variant="ghost"
                                    className="
                                        w-full flex items-center gap-3 justify-start px-2 py-2 cursor-pointer

                                        focus:outline-none
                                        focus-visible:outline-none

                                        focus:ring-0
                                        focus-visible:ring-0

                                        data-[state=open]:ring-0
                                        data-[state=open]:outline-none

                                        outline-none
                                        focus:outline-none
                                        focus-visible:outline-none
                                        ring-0
                                        focus:ring-0
                                        focus-visible:ring-0
                                    "
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-white">
                                                {session?.user?.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-medium">
                                                {firstName}
                                            </span>

                                        </div>
                                    </div>

                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                    
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <SignOutButton />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div> */}
                    
                    {/* <Button 
                        variant="ghost"
                        onClick={() => {
                            setSelectedAddDate(new Date())
                            setIsAddTaskOpen(true)
                        }}
                        className={`${baseItemClass} text-red-500 font-semibold justify-start w-full cursor-pointer`}    
                    >
                        <CirclePlus size={18} />
                        <span>Add task</span>
                    </Button>
                    <Link href="/today"
                        onClick={() => setSideNavOpen(false)}
                        className={`${baseItemClass} ${linkClass("/today")}`}
                    >
                        <ListTodo size={18} />
                        <span>Today</span>
                    </Link>
                    <Link href="/upcoming"
                        onClick={() => setSideNavOpen(false)}
                        className={`${baseItemClass} ${linkClass("/upcoming")}`}    
                    >
                        <CalendarIcon size={18} />
                        <span>Upcoming</span>
                    </Link>
                    <button
                        onClick={() => {
                            setIsSearchOpen(true)
                            setSideNavOpen(false)
                        }}
                        className={`${baseItemClass} ${linkClass("/search")}`}
                    >
                        <Search size={18} />
                        <span>Search</span>
                    </button>
                </nav> */}

                { /* Add Todo dialog popup */ }
                <AddTaskDialog 
                    open={isAddTaskOpen} 
                    onOpenChange={setIsAddTaskOpen}  
                />

                { /* Search dialog popup */}
                <SearchDialog 
                    open={isSearchOpen}
                    onOpenChange={setIsSearchOpen}
                />

            </aside>
        </>
    );
}