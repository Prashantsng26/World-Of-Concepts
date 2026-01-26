"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, LayoutDashboard, Bookmark, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ isLight = false }: { isLight?: boolean }) {
    const { data: session } = useSession();

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
            isLight
                ? "bg-white/70 backdrop-blur-xl border-b border-slate-200/50"
                : "glass border-b border-white/5 bg-background/20"
        )}>
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary transition-colors">
                        <Book className="w-5 h-5 text-primary" />
                    </div>
                    <span className={cn(
                        "text-xl font-serif font-bold tracking-wider transition-colors",
                        isLight ? "text-slate-900" : "text-white"
                    )}>WOC</span>
                </Link>

                <div className="flex items-center gap-4">
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://avatar.vercel.sh/${session.user?.email}`} />
                                        <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <Link href="/dashboard">
                                    <DropdownMenuItem>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                </Link>
                                <Link href="/bookmarks">
                                    <DropdownMenuItem>
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        <span>Bookmarks</span>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className={cn(
                                    "text-sm transition-colors",
                                    isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-white/70 hover:text-white"
                                )}>Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button className="text-sm rounded-full shadow-lg">Explore Free</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
