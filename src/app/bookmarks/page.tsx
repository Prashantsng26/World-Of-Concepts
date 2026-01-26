"use client";

import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { StarsBackground } from "@/components/layout/StarsBackground";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bookmark, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BookmarksPage() {
    const { data: bookmarks, isLoading } = useQuery({
        queryKey: ["bookmarks"],
        queryFn: async () => {
            const res = await fetch("/api/bookmarks");
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
                        <Bookmark className="text-primary w-8 h-8" />
                        Saved Knowledge
                    </h1>
                    <p className="text-muted-foreground text-lg">Your personal library of curated concepts.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-48 w-full bg-white/5 animate-pulse rounded-xl" />)
                    ) : bookmarks?.length > 0 ? (
                        bookmarks.map((bookmark: any) => (
                            <Link
                                key={bookmark.id}
                                href={`/explorer?q=${encodeURIComponent(bookmark.node.topic.query)}&mode=${bookmark.node.topic.mode}`}
                            >
                                <Card className="glass border-white/10 hover:border-primary/30 transition-all group overflow-hidden h-full">
                                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                        <Badge variant="outline" className="text-[10px]">{bookmark.node.topic.query}</Badge>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        <h3 className="text-xl font-serif font-bold text-white group-hover:text-primary transition-colors">
                                            {bookmark.node.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3 italic">
                                            {bookmark.node.contents[0]?.summary}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="md:col-span-2 lg:col-span-3 text-center py-20 space-y-6 glass border-white/5 rounded-2xl">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto opacity-10">
                                <Bookmark className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif text-white">Your library is empty.</h3>
                                <p className="text-muted-foreground">Save nodes while exploring to build your personal knowledge base.</p>
                            </div>
                            <Link href="/">
                                <button className="text-primary hover:underline font-medium">Explore Topics</button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
