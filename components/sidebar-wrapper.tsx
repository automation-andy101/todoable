"use client";

import { useState } from 'react';
import Sidebar from "./sidebar";
import { Button } from './ui/button';
import { Menu, PanelLeft } from 'lucide-react';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
    const [sideNavOpen, setSideNavOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col md:flex-row">

            {/* Hamburger (mobile only) */}
            {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => setSideNavOpen(true)}
                className={`fixed top-4 left-4 z-50 md:hidden ${sideNavOpen ? "hidden" : ""}`}
            >
                <Menu className="w-6 h-6" /> 
            </Button> */}
            
            {/* Sidebar */}
            <Sidebar
                sideNavOpen={sideNavOpen}
                setSideNavOpen={setSideNavOpen}
            />
            
            {/* Mobile Top Bar */}
            <div className="md:hidden sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSideNavOpen(!sideNavOpen)}
                >
                    <Menu className="w-6 h-6" />
                </Button>

                <span className="ml-3 font-semibold text-lg">
                    {/* optional: dynamic title later */}
                </span>
            </div>

            {/* Main Content */}
            <main className='w-full'>
                {children}
            </main>
        </div>
    );
}
