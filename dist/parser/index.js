/**
 * The class creates the structure for the text parsed from JSX/TSX components
 */
export class Parser {
    constructor() {
    }
    async parseProject() {
        console.log("⏳ Parser started...");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 секунды
        console.log("✅ Parser finished.");
    }
}
