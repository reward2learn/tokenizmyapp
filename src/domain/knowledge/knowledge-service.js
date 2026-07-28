import { buildStructuredPromptFromSnippets, KNOWLEDGE_SEED_SNIPPETS, } from '@/domain/knowledge/knowledge-seed';
export class KnowledgeService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSnippetByKey(key) {
        try {
            const row = await this.db.knowledgeSnippet.findUnique({ where: { key } });
            if (row) {
                return { key: row.key, category: row.category, content: row.content };
            }
        }
        catch (err) {
            console.warn('[knowledge] snippet lookup failed, using seed fallback:', key, err);
        }
        const seed = KNOWLEDGE_SEED_SNIPPETS.find((s) => s.key === key);
        return seed ? { key: seed.key, category: seed.category, content: seed.content } : null;
    }
    async getSnippetsByCategory(category) {
        const rows = await this.db.knowledgeSnippet.findMany({
            where: { category },
            orderBy: { key: 'asc' },
        });
        if (rows.length) {
            return rows.map((r) => ({ key: r.key, category: r.category, content: r.content }));
        }
        return KNOWLEDGE_SEED_SNIPPETS
            .filter((s) => s.category === category)
            .map((s) => ({ key: s.key, category: s.category, content: s.content }));
    }
    async getAllSnippets() {
        const rows = await this.db.knowledgeSnippet.findMany({ orderBy: { key: 'asc' } });
        if (rows.length) {
            return rows.map((r) => ({ key: r.key, category: r.category, content: r.content }));
        }
        return KNOWLEDGE_SEED_SNIPPETS.map((s) => ({
            key: s.key,
            category: s.category,
            content: s.content,
        }));
    }
    async buildSystemPrompt() {
        const snippets = await this.getAllSnippets();
        return buildStructuredPromptFromSnippets(snippets);
    }
}
