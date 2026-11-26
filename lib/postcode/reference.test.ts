import assert from "node:assert/strict";
import test from "node:test";
import {
  findNipostPlace,
  listNipostLgas,
  listNipostStates,
  matchNipostState,
  NIPOST_STATES_CACHE_MS,
  nipostAreaLabel,
} from "@/lib/postcode/reference";

const statesBody = {
  data: {
    states: [
      { code: "LA", name: "Lagos" },
      { code: "FC", name: "Federal Capital Territory" },
    ],
  },
};

test("state names from the listing form match the NIPOST register", () => {
  const states = [
    { code: "LA", name: "Lagos" },
    { code: "FC", name: "Federal Capital Territory" },
  ];
  assert.equal(matchNipostState("Lagos", states)?.code, "LA");
  assert.equal(matchNipostState("FCT", states)?.code, "FC");
  assert.equal(matchNipostState("Lekki", states), null);
});

test("LGA list uses the state the owner picked and does not spend a lookup", async () => {
  const states = await listNipostStates({
    apiKey: "nipost_live_secret",
    fetchImpl: async () => Response.json(statesBody),
  });
  assert.equal(states.ok, true);
  if (!states.ok) return;
  const lagos = matchNipostState("Lagos", states.states);
  assert.ok(lagos);

  let path = "";
  const lgas = await listNipostLgas(lagos!.code, {
    apiKey: "nipost_live_secret",
    baseUrl: "https://api.postcode.gov.ng/",
    fetchImpl: async (input) => {
      path = String(input);
      return Response.json({
        data: { lgas: [{ code: "11", name: "Eti-Osa" }] },
      });
    },
  });
  assert.equal(path, "https://api.postcode.gov.ng/v1/reference/lgas?state=LA");
  assert.equal(lgas.ok, true);
  if (lgas.ok) assert.equal(nipostAreaLabel(lagos!, lgas.lgas[0]), "Lagos · Eti-Osa · LA-11");
});

test("a code-only LGA still matches the value stored in the dropdown", () => {
  const lgas = [{ code: "11", name: null }];
  const selected = findNipostPlace(lgas, "11");
  assert.equal(selected?.code, "11");
  assert.equal(nipostAreaLabel({ code: "LA", name: "Lagos" }, selected!), "Lagos · 11 · LA-11");
});

test("the state catalog is reused until the cache expires", async () => {
  const cache: { value: { at: number; states: Array<{ code: string; name: string | null }> } | null } = { value: null };
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return Response.json(statesBody);
  };
  await listNipostStates({ apiKey: "nipost_live_secret", fetchImpl, cache, now: 0 });
  await listNipostStates({ apiKey: "nipost_live_secret", fetchImpl, cache, now: 1_000 });
  assert.equal(calls, 1);
  await listNipostStates({ apiKey: "nipost_live_secret", fetchImpl, cache, now: NIPOST_STATES_CACHE_MS });
  assert.equal(calls, 2);
});
