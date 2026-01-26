export const stringifyJson = (v: any) => JSON.stringify(v ?? []);

export const parseJson = <T>(s: string | null | undefined, fallback: T): T => {
    if (!s) return fallback;
    try {
        // Handle potential markdown code blocks returned by AI
        const clean = s.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
        return JSON.parse(clean);
    } catch (error) {
        console.warn("[JSON Parse Warning]: Could not parse string, returning fallback.");
        return fallback;
    }
};

export const safeParseLLMResponse = (content: string) => {
    try {
        const clean = content.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
        return JSON.parse(clean);
    } catch (e) {
        console.error("[LLM Response Parse Error]:", content);
        throw new Error("The knowledge transmission was garbled. Please try again.");
    }
};
