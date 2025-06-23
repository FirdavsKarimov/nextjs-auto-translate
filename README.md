# Algebras Auto Intl

An automated internationalization (i18n) tool for React and Next.js applications that intelligently extracts, manages, and translates JSX content. Similar to lingo.dev, it provides automatic string extraction and dictionary generation.

## Features

- 🔍 **Automatic String Extraction** - Scans your React/JSX files and extracts translatable content
- 🔒 **Smart Caching** - Uses lock files and hashing to avoid unnecessary re-parsing
- 🌐 **Dictionary Generation** - Automatically generates translation dictionaries during build
- 📁 **File-Based Organization** - Groups translations by source file with relative scope paths
- 🎯 **Mock Translation Service** - Includes fake translation API for development
- ⚡ **Next.js Integration** - Seamless integration with Next.js build process
- 📝 **Multiple Output Formats** - Generates both JSON and ES module dictionary files
- 🚀 **Performance Optimized** - Skips unchanged files and uses efficient parsing

## Installation

```bash
npm install algebras-auto-intl
```

## Quick Start

### With Next.js

Add the plugin to your `next.config.ts`:

```typescript
import autoIntl from "algebras-auto-intl";

const nextConfig = {
  // your existing config
};

export default autoIntl({
  includeNodeModules: false, // optional - scan node_modules
  targetLocales: ["en", "es", "fr", "de"], // languages to generate
  outputDir: "src/intl" // where to output dictionary files
})(nextConfig);
```

### Standalone Usage

```typescript
import { Parser } from "algebras-auto-intl";

const parser = new Parser({
  includeNodeModules: false // optional
});

const scopeMap = await parser.parseProject();
console.log("Extracted strings:", scopeMap);
```

## How It Works

The tool automatically scans your React/JSX files and extracts text content from JSX elements. It creates a structured map of all translatable strings with:

- **Unique scope identifiers** based on code location
- **Content hashing** for change detection
- **Element structure preservation** for complex JSX hierarchies
- **Translation metadata** including context and overrides

### Example JSX

```jsx
function Welcome() {
  return (
    <div>
      <h1>Welcome to our app!</h1>
      <p>
        Get started by <strong>clicking here</strong>
      </p>
    </div>
  );
}
```

### Generated Dictionary Structure

The plugin generates a dictionary with file-based organization:

```javascript
{
  "version": 0.1,
  "files": {
    "src/components/Welcome.tsx": {
      "entries": {
        "program/body1/declaration/body/body1/argument/children1": {
          "content": {
            "en": "Welcome to our app!",
            "es": "[ES] Welcome to our app!",
            "fr": "[FR] Welcome to our app!",
            "de": "[DE] Welcome to our app!"
          },
          "hash": "abc123..."
        },
        "program/body1/declaration/body/body1/argument/children3": {
          "content": {
            "en": "Get started by <element:strong>clicking here</element:strong>",
            "es": "[ES] Get started by <element:strong>clicking here</element:strong>",
            "fr": "[FR] Get started by <element:strong>clicking here</element:strong>",
            "de": "[DE] Get started by <element:strong>clicking here</element:strong>"
          },
          "hash": "def456..."
        }
      }
    }
  }
}
```

### Generated Files

When you build your project, the plugin creates:

- `src/intl/dictionary.js` - ES module dictionary for importing
- `src/intl/dictionary.json` - JSON format for debugging
- `.intl/source.json` - Extracted source strings with metadata

### Using the Dictionary

```javascript
// Import the generated dictionary
import dictionary from "./src/intl/dictionary.js";

// Access translations
const filePath = "src/components/Welcome.tsx";
const scopePath = "program/body1/declaration/body/body1/argument/children1";
const locale = "es";

const translation =
  dictionary.files[filePath].entries[scopePath].content[locale];
console.log(translation); // "[ES] Welcome to our app!"
```

## API Reference

### Parser

The main parsing engine that extracts translatable strings from your codebase.

```typescript
import { Parser, ParserOptions } from "algebras-auto-intl";

const parser = new Parser(options);
```

#### ParserOptions

```typescript
interface ParserOptions {
  includeNodeModules?: boolean; // Default: false
}
```

#### Methods

- `parseProject(): Promise<ScopeMap>` - Scans project and returns extracted strings

### Translation System

Implement custom translation providers:

```typescript
import { Translator, ITranslateProvider } from "algebras-auto-intl";

class MyTranslateProvider implements ITranslateProvider {
  async translateText(text: string, targetLang: string): Promise<string> {
    // Your translation logic here
    return translatedText;
  }
}

const translator = new Translator(new MyTranslateProvider());
const dictionary = await translator.translate(scopeMap, ["es", "fr", "de"]);
```

### Dictionary Generation

The new dictionary generation system automatically creates translation files during build:

```typescript
import { DictionaryGenerator } from "algebras-auto-intl";

const generator = new DictionaryGenerator({
  targetLocales: ["en", "es", "fr", "de"],
  outputDir: "src/intl"
});

await generator.generateDictionary(sourceMap);
```

### Dictionary Loader Utility

Use the DictionaryLoader to easily access translations in your application:

```typescript
import { DictionaryLoader } from "algebras-auto-intl/integration/DictionaryLoader";

const loader = new DictionaryLoader("./intl/dictionary.js");

// Get a specific translation
const translation = await loader.getTranslation(
  "src/components/Welcome.tsx",
  "program/body1/declaration/body/body1/argument/children1",
  "es"
);

// Get all available locales
const locales = await loader.getAvailableLocales();

// Get all translations for a file
const fileTranslations = await loader.getFileTranslations(
  "src/components/Welcome.tsx",
  "es"
);

// Check if a translation exists
const exists = await loader.hasTranslation(
  "src/components/Welcome.tsx",
  "program/body1/declaration/body/body1/argument/children1",
  "es"
);
```

### Storage Classes

#### SourceStore

Manages the extracted source strings:

```typescript
import { SourceStore } from "algebras-auto-intl";

const store = new SourceStore();
store.save(scopeMap);
const loaded = store.load();
```

#### DictionaryStore

Manages translated dictionaries:

```typescript
import { DictionaryStore } from "algebras-auto-intl";

const store = new DictionaryStore();
store.save(dictionary);
const merged = store.merge(newTranslations);
```

## File Structure

The tool creates the following directory structure:

```
.intl/
├── source.json      # Extracted source strings with file-based organization
├── .lock           # Temporary lock file during parsing
└── .scheduled      # Process scheduling flag

src/intl/           # Generated dictionary files (configurable location)
├── dictionary.js   # ES module dictionary for importing
└── dictionary.json # JSON format for debugging/inspection
```

## Configuration

### Parser Options

- `includeNodeModules`: Whether to scan files in node_modules (default: false)

### Mock Translation Service

The library includes a mock translation service for development that prefixes translations:

- `en`: Returns original text unchanged
- `es`: `[ES] Original text`
- `fr`: `[FR] Original text`
- `de`: `[DE] Original text`

You can replace this with a real translation API by modifying the `MockTranslationService` class in `src/translator/DictionaryGenerator.ts`.

### Supported File Types

- `.tsx` files
- `.jsx` files

### Ignored Directories

By default, the following directories are excluded:

- `**/.next/**`
- `**/dist/**`
- `**/node_modules/**` (unless `includeNodeModules: true`)

## Advanced Usage

### Custom Translation Workflow

```typescript
import { Parser, Translator, DictionaryStore } from "algebras-auto-intl";

// 1. Extract strings
const parser = new Parser();
const sources = await parser.parseProject();

// 2. Translate
const translator = new Translator(myProvider);
const translations = await translator.translate(sources, ["es", "fr"]);

// 3. Store translations
const dictStore = new DictionaryStore();
const merged = dictStore.merge(translations);
dictStore.save(merged);
```

### Integration with Build Systems

The Next.js plugin automatically runs during development and build processes. For other build systems, you can integrate the parser into your build pipeline:

```javascript
// webpack.config.js
const { Parser } = require("algebras-auto-intl");

module.exports = {
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tapAsync(
          "AutoIntl",
          async (params, callback) => {
            const parser = new Parser();
            await parser.parseProject();
            callback();
          }
        );
      }
    }
  ]
};
```

## Performance

- ⚡ **Lock-based concurrency** prevents multiple simultaneous parsing
- 🔄 **Change detection** via content hashing skips unchanged files
- 📊 **Incremental updates** only processes modified content
- 🎯 **Targeted scanning** excludes build directories and dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
