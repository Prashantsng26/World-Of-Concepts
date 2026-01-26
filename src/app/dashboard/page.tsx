"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Book, Clock, Map, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const { data: topics, isLoading } = useQuery({
        queryKey: ["user-topics"],
        queryFn: async () => {
            const res = await fetch("/api/topics/user");
            return res.json();
        },
    });

    return (
        <div className="min-h-screen relative flex flex-col">
            <Navbar />
            <StarsBackground />

            <main className="flex-1 pt-24 pb-12 px-4 max-w-7xl mx-auto w-full">
                <header className="mb-8 space-y-2">
                    <h1 className="text-4xl font-serif font-bold text-white flex items-center gap-3">
                        <Map className="text-primary w-8 h-8" />
                        Your Universe
                    </h1>
                    <p className="text-muted-foreground text-lg">Tracks your exploration of the concept galaxy.</p>
                </header>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 glass border-white/10">
                        <CardHeader>
                            <CardTitle className="font-serif">Recently Explored</CardTitle>
                            <CardDescription>All the topics you have recently searched and expanded.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-lg" />)}
                                </div>
                            ) : topics?.length > 0 ? (
                                <div className="space-y-3">
                                    {topics.map((topic: any) => (
                                        <Link key={topic.id} href={`/explorer?q=${encodeURIComponent(topic.query)}&mode=${topic.mode}`}>
                                            <div className="group flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-primary/30 bg-white/5 hover:bg-primary/5 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                                                        <Search className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{topic.query}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Badge variant="outline" className="text-[10px] py-0">{topic.mode}</Badge>
                                                            <span><Clock className="inline w-3 h-3 mr-1" /> {new Date(topic.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-20">
                                        <Book className="w-8 h-8" />
                                    </div>
                                    <p className="text-muted-foreground">You haven't explored any topics yet.</p>
                                    <Link href="/">
                                        <button className="text-primary hover:underline font-medium">Start your first journey</button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="font-serif">Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Topics Explored</span>
                                    <span className="font-bold text-white">{topics?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Knowledge Level</span>
                                    <span className="font-bold text-primary">Explorer</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
