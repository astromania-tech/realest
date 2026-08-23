#!/usr/bin/env tsx
"use strict";
/**
 * scripts/import-resend-to-db.ts
 *
 * One-time reverse import: pulls real contacts from Resend WAITLIST audience
 * and upserts them into the Supabase public.waitlist table.
 *
 * Run:
 *   npx tsx scripts/import-resend-to-db.ts --dry-run   ← preview only
 *   npx tsx scripts/import-resend-to-db.ts             ← actually import
 *
 * Idempotent — safe to run multiple times. Existing rows are not overwritten
 * (only updated if first_name/last_name were null).
 *
 * Requires: RESEND_API_KEY, DATABASE_URL in .env
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
// ─── Config ───────────────────────────────────────────────────────────────────
var RESEND_KEY = (_a = process.env.RESEND_API_KEY) !== null && _a !== void 0 ? _a : "";
if (!RESEND_KEY) {
    console.error("❌  RESEND_API_KEY not set");
    process.exit(1);
}
var DRY_RUN = process.argv.includes("--dry-run");
// Only import from the WAITLIST audience — that is the authoritative source
// for waitlist members. Owners/Agents audiences are for registered users and
// do not map to the waitlist table.
var WAITLIST_AUDIENCE_ID = (_b = process.env.RESEND_AUDIENCE_WAITLIST_ID) !== null && _b !== void 0 ? _b : "b52453fa-50d5-4350-b745-4528b551adcd";
var prisma = new client_1.PrismaClient();
// ─── Test-email detection (same rules as scrub script) ────────────────────────
function isTestEmail(email) {
    var e = email.toLowerCase().trim();
    if (e.includes("@example."))
        return true;
    if (e.startsWith("e2e."))
        return true;
    var typoVariants = [
        "pre4ebi@gmail.cont", "pre4ebi@gmail.coo", "pre4ebi@gmail.cob", "pre4ebi@gmail.co",
    ];
    if (typoVariants.includes(e))
        return true;
    var fakeAddresses = [
        "fsaf@fafa.com", "okoko@mfa.com", "ddindia1dd@edca.cao",
        "jok@jad.co", "jom@hn.sa", "da@hb.li", "john212@hmail.com", "joh@example.cp",
        "john@mail.coi", "john@mail.co", "john@mail.com", "john@gmail.com",
        "john@example.co", "john@example.coi", "john@example.coma", "john@example.con",
        "john@example.cm", "john@example.cp", "jamesbet@mail.co", "johnaxel@mail.com",
        "sam@gmail.com", "bellonjohn@gmail.com", "james@hi.co", "johncena@gmail.com",
        "james@marrow.com", "jane@example.com", "alamusu@mail.com",
        "sammyyoung5600@mail.co", "sammyyoung56@gmail.com", "sammyyuoung@gmail.co",
        "sammyyoung560@gmail.com", "sammyyoung500006@gmail.com",
        "sammyyoung5054506@gmail.com", "sammyyoung5000006@gmail.com",
        "okoyenset@yahoo.com", "john.smith@example.com", "test.user@example.com",
    ];
    if (fakeAddresses.includes(e))
        return true;
    return false;
}
function listContacts(audienceId) {
    return __awaiter(this, void 0, void 0, function () {
        var res, _a, _b, _c, payload;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, fetch("https://api.resend.com/audiences/".concat(audienceId, "/contacts"), {
                        headers: { Authorization: "Bearer ".concat(RESEND_KEY) },
                    })];
                case 1:
                    res = _e.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    _a = Error.bind;
                    _c = (_b = "Fetch failed (".concat(audienceId, "): ").concat(res.status, " ")).concat;
                    return [4 /*yield*/, res.text()];
                case 2: throw new (_a.apply(Error, [void 0, _c.apply(_b, [_e.sent()])]))();
                case 3: return [4 /*yield*/, res.json()];
                case 4:
                    payload = _e.sent();
                    return [2 /*return*/, (_d = payload.data) !== null && _d !== void 0 ? _d : []];
            }
        });
    });
}
function generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}
// ─── Main ─────────────────────────────────────────────────────────────────────
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var allContacts, realContacts, testCount, inserted, updated, skipped, errors, i, c, email, firstName, lastName, existing, needsUpdate, err_1, msg, dbCount;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("═══════════════════════════════════════════════════════");
                    console.log("  RealEST — Resend → Supabase Waitlist Import");
                    console.log("═══════════════════════════════════════════════════════");
                    if (DRY_RUN)
                        console.log("⚠️   DRY RUN — no DB writes will happen\n");
                    console.log("\n\uD83D\uDCE1 Fetching contacts from WAITLIST audience (".concat(WAITLIST_AUDIENCE_ID, ")..."));
                    return [4 /*yield*/, listContacts(WAITLIST_AUDIENCE_ID)];
                case 1:
                    allContacts = _c.sent();
                    console.log("   ".concat(allContacts.length, " total contacts in Resend"));
                    realContacts = allContacts.filter(function (c) {
                        if (!c.email)
                            return false;
                        if (isTestEmail(c.email))
                            return false;
                        if (c.unsubscribed === true)
                            return false;
                        return true;
                    });
                    testCount = allContacts.length - realContacts.length;
                    console.log("   ".concat(testCount, " skipped (test/fake/unsubscribed)"));
                    console.log("   ".concat(realContacts.length, " to process\n"));
                    inserted = 0;
                    updated = 0;
                    skipped = 0;
                    errors = [];
                    i = 0;
                    _c.label = 2;
                case 2:
                    if (!(i < realContacts.length)) return [3 /*break*/, 13];
                    c = realContacts[i];
                    email = c.email.trim().toLowerCase();
                    firstName = (((_a = c.first_name) === null || _a === void 0 ? void 0 : _a.trim()) || null);
                    lastName = (((_b = c.last_name) === null || _b === void 0 ? void 0 : _b.trim()) || null);
                    process.stdout.write("   [".concat(i + 1, "/").concat(realContacts.length, "] ").concat(email.padEnd(40)));
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 11, , 12]);
                    return [4 /*yield*/, prisma.waitlist.findUnique({
                            where: { email: email },
                            select: { id: true, first_name: true, last_name: true },
                        })];
                case 4:
                    existing = _c.sent();
                    if (!existing) return [3 /*break*/, 7];
                    needsUpdate = (firstName && !existing.first_name) ||
                        (lastName && !existing.last_name);
                    if (!(!DRY_RUN && needsUpdate)) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.waitlist.update({
                            where: { email: email },
                            data: __assign(__assign({}, (firstName && !existing.first_name ? { first_name: firstName } : {})), (lastName && !existing.last_name ? { last_name: lastName } : {})),
                        })];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6:
                    process.stdout.write(needsUpdate ? "  → updated (name filled)\n" : "  → already exists, skipped\n");
                    needsUpdate ? updated++ : skipped++;
                    return [3 /*break*/, 10];
                case 7:
                    if (!!DRY_RUN) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.waitlist.create({
                            data: {
                                email: email,
                                first_name: firstName !== null && firstName !== void 0 ? firstName : "Waitlist",
                                last_name: lastName,
                                status: "active",
                                persona: "buyer_renter",
                                source: "resend_import",
                                referral_code: generateReferralCode(),
                                queue_score: 0,
                                subscribed_at: new Date(),
                            },
                        })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    process.stdout.write("  → INSERTED\n");
                    inserted++;
                    _c.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    err_1 = _c.sent();
                    msg = err_1 instanceof Error ? err_1.message : String(err_1);
                    process.stdout.write("  \u2192 ERROR: ".concat(msg, "\n"));
                    errors.push("".concat(email, ": ").concat(msg));
                    return [3 /*break*/, 12];
                case 12:
                    i++;
                    return [3 /*break*/, 2];
                case 13:
                    console.log("\n═══════════════════════════════════════════════════════");
                    console.log("  Results:");
                    console.log("    Inserted : ".concat(inserted));
                    console.log("    Updated  : ".concat(updated, " (names filled)"));
                    console.log("    Skipped  : ".concat(skipped, " (already in DB)"));
                    console.log("    Errors   : ".concat(errors.length));
                    if (errors.length > 0) {
                        console.log("\n  Errors:");
                        errors.forEach(function (e) { return console.log("    \u2717 ".concat(e)); });
                    }
                    if (DRY_RUN)
                        console.log("\n  Run without --dry-run to apply changes.");
                    console.log("═══════════════════════════════════════════════════════");
                    if (!!DRY_RUN) return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.waitlist.count({ where: { status: "active" } })];
                case 14:
                    dbCount = _c.sent();
                    console.log("\n\u2705 DB waitlist now has ".concat(dbCount, " active members."));
                    _c.label = 15;
                case 15: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (err) { console.error("❌ Fatal:", err); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
