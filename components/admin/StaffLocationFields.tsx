"use client";

import { useMemo } from "react";
import { NIGERIAN_STATES, getStateByName, getLGAsByState } from "@/lib/utils/nigerianLocations";
import { Input } from "@/components/ui/input";
import { CONNECT_CONTROL_CLASS, CONNECT_INPUT_CLASS } from "@/lib/styles/connect-form";

export function StaffLocationFields({
  state,
  lga,
  onStateChange,
  onLgaChange,
  idPrefix = "staff",
}: {
  state: string;
  lga: string;
  onStateChange: (state: string) => void;
  onLgaChange: (lga: string) => void;
  idPrefix?: string;
}) {
  const lgas = useMemo(() => {
    const match = getStateByName(state);
    if (!match) return [];
    return getLGAsByState(match.code).map((row) => row.name);
  }, [state]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="min-w-0 space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${idPrefix}-state`}>
          Operating state
        </label>
        <select
          id={`${idPrefix}-state`}
          className={CONNECT_CONTROL_CLASS}
          value={state}
          onChange={(event) => {
            onStateChange(event.target.value);
            onLgaChange("");
          }}
          required
        >
          <option value="">Choose state</option>
          {NIGERIAN_STATES.map((row) => (
            <option key={row.code} value={row.name}>
              {row.name}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0 space-y-2">
        <label className="block text-sm font-medium" htmlFor={`${idPrefix}-lga`}>
          Operating LGA
        </label>
        {lgas.length > 0 ? (
          <select
            id={`${idPrefix}-lga`}
            className={CONNECT_CONTROL_CLASS}
            value={lga}
            onChange={(event) => onLgaChange(event.target.value)}
            required
          >
            <option value="">Choose LGA</option>
            {lgas.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id={`${idPrefix}-lga`}
            className={CONNECT_INPUT_CLASS}
            value={lga}
            onChange={(event) => onLgaChange(event.target.value)}
            placeholder="e.g. Ikeja"
            required
          />
        )}
        <p className="text-xs text-muted-foreground">
          Used to match officers to properties in the same state (and prefer same LGA).
        </p>
      </div>
    </div>
  );
}
