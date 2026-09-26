#!/usr/bin/env node
/**
 * OpenAPI Spec Generator
 *
 * Walks app/api route.ts files for export const openApiGET|POST|... object
 * literals and merges them into lib/openapi/generated.json.
 *
 * Object literals are evaluated via the TypeScript AST (no vm/eval).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const appApiDir = path.join(rootDir, "app", "api");
const generatedPath = path.join(rootDir, "lib", "openapi", "generated.json");

type HttpMethod = "get" | "post" | "put" | "delete" | "patch" | string;

type OpenApiOperation = {
  method?: string;
  summary?: string;
  tags?: string[];
  operationId?: string;
  [key: string]: unknown;
};

type OpenApiPathItem = Record<string, OpenApiOperation>;

type OpenApiSpec = {
  openapi: string;
  info: Record<string, unknown>;
  servers: Array<Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
    [key: string]: unknown;
  };
  paths: Record<string, OpenApiPathItem>;
  tags?: Array<{ name: string; description?: string }>;
  [key: string]: unknown;
};

type ExportBlock = {
  method: HttpMethod;
  objectText: string;
};

function defaultSpec(): OpenApiSpec {
  return {
    openapi: "3.0.0",
    info: {
      title: "RealEST Property Marketplace API",
      description:
        "Nigerian property marketplace API with ML validation, geospatial search, and intelligent matching",
      version: "2.0.0",
      contact: {
        name: "RealEST Support",
        email: "support@realest.ng",
      },
      license: {
        name: "Proprietary",
      },
    },
    servers: [
      { url: "http://localhost:3000", description: "Development server" },
      { url: "https://realest.ng", description: "Production server" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Supabase JWT Auth token",
        },
      },
      schemas: {},
    },
    paths: {},
  };
}

const TAG_DESCRIPTIONS: Record<string, string> = {
  Auth: "Authentication and recovery flows",
  Dashboard: "Dashboard-level owner and agent workflows",
  "Dashboard - Listings": "Listing management from the dashboard",
  "Dashboard - Owner Inquiries": "Owner inbox and inquiry actions",
  Admin: "Administrative operations",
  "Admin - Analytics": "Platform reporting and metrics",
  "Admin - Emails": "Campaigns, previews, audiences, and test sends",
  "Admin - Properties": "Admin property review and moderation",
  "Admin - Reports": "Manual vetting and operational reports",
  "Admin - Validation": "ML, duplicate, image, and document checks",
  "Admin - Users": "User moderation and account management",
  "Admin - Waitlist": "Waitlist administration",
  "Admin - Duplicates": "Duplicate resolution workflows",
  "Admin - Subadmins": "Sub-admin management",
  "Admin - Verification": "Agent verification workflows",
  Properties: "Public property browsing and listing operations",
  "Properties - Media": "Property media management",
  "Properties - Documents": "Property document management",
  "Properties - Reviews": "Property reviews and feedback",
  "Properties - Favorites": "Saved property actions",
  "Properties - Owner": "Owner-facing property listing operations",
  "Properties - Public": "Public property discovery and detail pages",
  "Properties - Search": "Property search and discovery",
  Profile: "Authenticated user profile management",
  Inquiries: "Buyer and seller inquiry workflows",
  Notifications: "User notification management",
  Referral: "Referral and invite flows",
  Search: "Search endpoints",
  System: "System status, health, and configuration",
  Utility: "Utility endpoints for uploads and related helpers",
  Upload: "Upload and signed URL operations",
  Waitlist: "Waitlist signup and follow-up",
};

const TAG_PRIORITY = [
  "Auth",
  "Properties - Search",
  "Properties - Public",
  "Properties - Owner",
  "Properties - Media",
  "Properties - Documents",
  "Properties - Reviews",
  "Properties - Favorites",
  "Properties",
  "Inquiries",
  "Profile",
  "Dashboard - Listings",
  "Dashboard - Owner Inquiries",
  "Dashboard",
  "Admin - Validation",
  "Admin - Analytics",
  "Admin - Emails",
  "Admin - Properties",
  "Admin - Reports",
  "Admin - Duplicates",
  "Admin - Users",
  "Admin - Waitlist",
  "Admin - Subadmins",
  "Admin - Verification",
  "Admin",
  "Notifications",
  "Referral",
  "Search",
  "System",
  "Upload",
  "Utility",
  "Waitlist",
];

const TAG_ALIASES = new Map<string, string>([
  ["user", "Profile"],
  ["users", "Admin - Users"],
  ["profile", "Profile"],
  ["properties", "Properties"],
  ["property", "Properties"],
  ["favorites", "Properties - Favorites"],
  ["saved", "Properties - Favorites"],
  ["media", "Properties - Media"],
  ["documents", "Properties - Documents"],
  ["document", "Admin - Validation"],
  ["reviews", "Properties - Reviews"],
  ["owner", "Properties - Owner"],
  ["public", "Properties - Public"],
  ["search", "Search"],
  ["analytics", "Admin - Analytics"],
  ["emails", "Admin - Emails"],
  ["email", "Admin - Emails"],
  ["reports", "Admin - Reports"],
  ["validation", "Admin - Validation"],
  ["vetting", "Admin - Validation"],
  ["vet", "Admin - Validation"],
  ["ml", "Admin - Validation"],
  ["duplicates", "Admin - Duplicates"],
  ["duplicate", "Admin - Duplicates"],
  ["waitlist", "Waitlist"],
  ["subadmins", "Admin - Subadmins"],
  ["verify-agent", "Admin - Verification"],
  ["dashboard", "Dashboard"],
  ["listings", "Dashboard - Listings"],
  ["inquiries", "Dashboard - Owner Inquiries"],
  ["auth", "Auth"],
  ["notifications", "Notifications"],
  ["referral", "Referral"],
  ["upload", "Upload"],
  ["system", "System"],
  ["utility", "Utility"],
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(await walk(full));
    else if (entry.isFile() && /route\.(ts|js|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function toOpenApiPath(filePath: string): string {
  const rel = path.relative(path.join(rootDir, "app"), filePath).replace(/\\/g, "/");
  const withoutRoute = rel.replace(/\/route\.(ts|js|mjs)$/, "");
  return (
    "/" +
    withoutRoute
      .replace(/index$/, "")
      .replace(/\[([^\]]+?)\]/g, "{$1}")
  );
}

function deriveOperationId(method: string, openApiPath: string): string {
  const normalized = openApiPath
    .replace(/^\/api\//, "")
    .replace(/^api\//, "")
    .replace(/\{([^}]+)\}/g, (_, name: string) => name[0].toUpperCase() + name.slice(1))
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, chr: string | undefined) =>
      chr ? chr.toUpperCase() : "",
    );
  return `${method}${normalized[0]?.toUpperCase() ?? ""}${normalized.slice(1)}`;
}

function deriveTag(openApiPath: string): string {
  const segments = openApiPath.split("/").filter(Boolean);
  if (segments[1] === "saved-properties") return "Properties - Favorites";
  if (segments[1] === "search" && segments[2] === "properties") return "Properties - Search";
  if (segments[1] === "properties" && segments[2] === "owner") return "Properties - Owner";
  if (segments[1] === "properties" && segments[2] === "explore") return "Properties - Search";
  if (segments[1] === "properties" && segments[2] === "{id}" && segments[3] === "media")
    return "Properties - Media";
  if (segments[1] === "properties" && segments[2] === "{id}" && segments[3] === "documents")
    return "Properties - Documents";
  if (segments[1] === "properties" && segments[2] === "{id}" && segments[3] === "reviews")
    return "Properties - Reviews";
  if (segments[1] === "properties" && segments[2] === "{id}" && segments[3] === "favorites")
    return "Properties - Favorites";
  if (segments[1] === "properties" && segments[2] === "{id}" && segments[3] === "public")
    return "Properties - Public";
  if (segments[1] === "admin" && segments[2] === "validation") return "Admin - Validation";
  if (segments[1] === "admin" && segments[2] === "analytics") return "Admin - Analytics";
  if (segments[1] === "admin" && segments[2] === "emails") return "Admin - Emails";
  if (segments[1] === "admin" && segments[2] === "properties") return "Admin - Properties";
  if (segments[1] === "admin" && segments[2] === "reports") return "Admin - Reports";
  if (segments[1] === "admin" && segments[2] === "duplicates") return "Admin - Duplicates";
  if (segments[1] === "admin" && segments[2] === "users") return "Admin - Users";
  if (segments[1] === "admin" && segments[2] === "waitlist") return "Admin - Waitlist";
  if (segments[1] === "admin" && segments[2] === "subadmins") return "Admin - Subadmins";
  if (segments[1] === "admin" && segments[2] === "verify-agent") return "Admin - Verification";
  if (segments[1] === "admin") return "Admin";
  if (segments[1] === "dashboard" && segments[2] === "listings") return "Dashboard - Listings";
  if (segments[1] === "dashboard" && segments[2] === "owner")
    return "Dashboard - Owner Inquiries";
  if (segments[1] === "dashboard") return "Dashboard";
  if (segments[1] === "auth") return "Auth";
  if (segments[1] === "inquiries") return "Inquiries";
  if (segments[1] === "profile") return "Profile";
  if (segments[1] === "notifications") return "Notifications";
  if (segments[1] === "referral") return "Referral";
  if (segments[1] === "search") return "Search";
  if (segments[1] === "system") return "System";
  if (segments[1] === "upload") return "Upload";
  if (segments[1] === "waitlist") return "Waitlist";
  if (segments[1] === "properties") return "Properties";
  if (segments[1]) return segments[1][0].toUpperCase() + segments[1].slice(1);
  return "API";
}

function canonicalizeTag(tag: unknown): string | null {
  if (!tag || typeof tag !== "string") return null;
  const trimmed = tag.trim();
  const alias = TAG_ALIASES.get(trimmed.toLowerCase());
  return alias || trimmed;
}

function canonicalTagForPath(openApiPath: string, existingTags: unknown = []): string {
  const list = Array.isArray(existingTags) ? existingTags : [];
  const candidateTags = [deriveTag(openApiPath), ...list];
  for (const tag of candidateTags) {
    const canonical = canonicalizeTag(tag);
    if (canonical) return canonical;
  }
  return "API";
}

function normalizeTags(existingTags: unknown, openApiPath: string): string[] {
  return [canonicalTagForPath(openApiPath, existingTags)];
}

function buildTagDefinitions(
  spec: OpenApiSpec,
): Array<{ name: string; description?: string }> {
  const seen = new Set<string>();

  for (const pathItem of Object.values(spec.paths || {})) {
    for (const operation of Object.values(pathItem || {})) {
      for (const tag of operation?.tags || []) {
        seen.add(tag);
      }
    }
  }

  const canonicalSeen = new Set<string>();
  for (const tag of seen) {
    const canonical = canonicalizeTag(tag);
    if (canonical) canonicalSeen.add(canonical);
  }

  const orderedTags: Array<{ name: string; description?: string }> = [];
  for (const tagName of TAG_PRIORITY) {
    if (canonicalSeen.has(tagName)) {
      orderedTags.push({
        name: tagName,
        description: TAG_DESCRIPTIONS[tagName],
      });
      canonicalSeen.delete(tagName);
    }
  }

  for (const tagName of [...canonicalSeen].sort((a, b) => a.localeCompare(b))) {
    orderedTags.push({
      name: tagName,
      description: TAG_DESCRIPTIONS[tagName],
    });
  }

  return orderedTags;
}

function extractExportBlocks(content: string): ExportBlock[] {
  const exports: ExportBlock[] = [];
  const re = /export\s+const\s+(openApi(GET|POST|PUT|DELETE))\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    const method = match[2].toLowerCase();
    const equalsIndex = content.indexOf("=", re.lastIndex);
    if (equalsIndex === -1) continue;
    const braceStart = content.indexOf("{", equalsIndex);
    if (braceStart === -1) continue;

    let depth = 0;
    let state: "normal" | "line-comment" | "block-comment" | "string" = "normal";
    let quote = "";
    let escape = false;
    let endIndex = -1;

    for (let i = braceStart; i < content.length; i++) {
      const ch = content[i];
      const next = content[i + 1];

      if (state === "line-comment") {
        if (ch === "\n") state = "normal";
        continue;
      }

      if (state === "block-comment") {
        if (ch === "*" && next === "/") {
          state = "normal";
          i++;
        }
        continue;
      }

      if (state === "string") {
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\") {
          escape = true;
          continue;
        }
        if (ch === quote) state = "normal";
        continue;
      }

      if (ch === "/" && next === "/") {
        state = "line-comment";
        i++;
        continue;
      }

      if (ch === "/" && next === "*") {
        state = "block-comment";
        i++;
        continue;
      }

      if (ch === '"' || ch === "'" || ch === "`") {
        state = "string";
        quote = ch;
        continue;
      }

      if (ch === "{") depth++;
      if (ch === "}") {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex !== -1) {
      const objectText = content.slice(braceStart, endIndex + 1);
      exports.push({ method, objectText });
    }
  }
  return exports;
}

function propertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  if (ts.isComputedPropertyName(name) && ts.isStringLiteral(name.expression)) {
    return name.expression.text;
  }
  return null;
}

function literalToValue(node: ts.Expression): unknown {
  if (ts.isParenthesizedExpression(node)) return literalToValue(node.expression);
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
    return literalToValue(node.expression);
  }
  if (ts.isSatisfiesExpression(node)) return literalToValue(node.expression);

  if (ts.isObjectLiteralExpression(node)) {
    const out: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        throw new Error(
          `Unsupported object property kind ${ts.SyntaxKind[prop.kind]} in openApi literal`,
        );
      }
      const key = propertyName(prop.name);
      if (!key) {
        throw new Error("Unsupported computed property name in openApi literal");
      }
      out[key] = literalToValue(prop.initializer);
    }
    return out;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((el) => {
      if (ts.isSpreadElement(el)) {
        throw new Error("Spread elements are not supported in openApi literals");
      }
      return literalToValue(el);
    });
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return undefined;

  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    const value = Number(node.operand.text);
    return node.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }

  throw new Error(
    `Unsupported openApi literal node ${ts.SyntaxKind[node.kind]} (no identifiers/calls)`,
  );
}

/** Parse a JS/TS object literal without vm/eval. */
function parseOperation(objectText: string): OpenApiOperation {
  const sourceText = `const __op = (${objectText});`;
  const sourceFile = ts.createSourceFile(
    "openapi-op.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const statement = sourceFile.statements[0];
  if (!statement || !ts.isVariableStatement(statement)) {
    throw new Error("Failed to parse openApi object literal");
  }
  const decl = statement.declarationList.declarations[0];
  if (!decl?.initializer) {
    throw new Error("openApi object literal missing initializer");
  }

  const value = literalToValue(decl.initializer);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("openApi export must be an object literal");
  }
  return value as OpenApiOperation;
}

async function loadBaseSpec(): Promise<OpenApiSpec> {
  try {
    const raw = await fs.readFile(generatedPath, "utf8");
    return JSON.parse(raw) as OpenApiSpec;
  } catch {
    return defaultSpec();
  }
}

async function generateSpec(): Promise<void> {
  console.log("🔄 Generating OpenAPI specification...");

  try {
    const spec = await loadBaseSpec();
    spec.paths = spec.paths || {};
    spec.components = spec.components || { securitySchemes: {}, schemas: {} };
    spec.components.securitySchemes = spec.components.securitySchemes || {};
    spec.components.schemas = spec.components.schemas || {};
    spec.components.securitySchemes.bearerAuth =
      spec.components.securitySchemes.bearerAuth || {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Supabase JWT Auth token",
      };

    const routeFiles = await walk(appApiDir);
    let addedOperations = 0;

    for (const file of routeFiles) {
      const content = await fs.readFile(file, "utf8");
      const blocks = extractExportBlocks(content);
      if (blocks.length === 0) continue;

      const openApiPath = toOpenApiPath(file);
      spec.paths[openApiPath] = spec.paths[openApiPath] || {};

      for (const block of blocks) {
        const operation = parseOperation(block.objectText);
        const method = block.method;
        operation.method = operation.method || method;
        operation.summary =
          operation.summary || `Auto-generated ${method.toUpperCase()} ${openApiPath}`;
        operation.tags = normalizeTags(operation.tags, openApiPath);
        operation.operationId =
          operation.operationId || deriveOperationId(method, openApiPath);
        spec.paths[openApiPath][method] = operation;
        addedOperations++;
      }
    }

    for (const [openApiPath, pathItem] of Object.entries(spec.paths || {})) {
      for (const [method, operation] of Object.entries(pathItem || {})) {
        if (!operation || typeof operation !== "object") continue;
        operation.tags = normalizeTags(operation.tags, openApiPath);
        operation.operationId =
          operation.operationId || deriveOperationId(method, openApiPath);
        operation.summary =
          operation.summary || `Auto-generated ${method.toUpperCase()} ${openApiPath}`;
        spec.paths[openApiPath][method] = operation;
      }
    }

    spec.tags = buildTagDefinitions(spec);

    await fs.writeFile(generatedPath, JSON.stringify(spec, null, 2));
    console.log("✅ OpenAPI spec generated successfully!");
    console.log(`📄 Saved to: ${path.relative(process.cwd(), generatedPath)}`);
    console.log(`📊 Paths: ${Object.keys(spec.paths).length}`);
    console.log(`🧩 Operations: ${addedOperations}`);
    console.log(`🏷️  Schemas: ${Object.keys(spec.components.schemas || {}).length}`);
  } catch (error: unknown) {
    console.error("❌ Error generating OpenAPI spec:");
    console.error(error);
    process.exit(1);
  }
}

void generateSpec();
