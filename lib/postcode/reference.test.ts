import assert from "node:assert/strict";
import test from "node:test";
import { listNipostLgas, listNipostStates, matchNipostState, nipostAreaLabel } from "@/lib/postcode/reference";

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
