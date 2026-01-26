import OpenAI from "openai";

export type Mode = "SHORT" | "BRIEF" | "DETAILED";

// Create a lazy getter for OpenAI to prevent crash on import if key is missing
export const getOpenAI = () => {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY");
    }
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

export const MODE_CONFIG = {
    SHORT: {
        nodeCount: "4-6",
        depth: 2,
        summaryLines: "3-5",
        bullets: 4,
        examples: 1,
    },
    BRIEF: {
        nodeCount: "6-8",
        depth: 3,
        summaryLines: "10-15",
        bullets: 7,
        examples: 2,
    },
    DETAILED: {
        nodeCount: "10-14",
        depth: 4,
        summaryLines: "25-40",
        bullets: 12,
        examples: 4,
    },
};
