/**
 * Tests for fromEPDToMonitorState()
 *
 * Covered scenarios:
 *
 * ┌────────┬────────────────────────────────────────────────────────┬────────────────┐
 * │ Case # | Condition Summary                                      │ Expected State │
 * ├────────┼────────────────────────────────────────────────────────┼────────────────┤
 * │ 1.     │ Service ACTIVE, probing disabled                       │ N_D            │
 * │ 2.     │ Service ACTIVE, no lastRequest                         │ N_D            │
 * │ 3.     │ Service ACTIVE, lastRequest too old + response older   │ N_D            │
 * │ 4.     │ Service ACTIVE, missing responseReceived               │ N_D            │
 * │ 5.     │ Service ACTIVE, responseStatus = KO                    │ OFFLINE        │
 * │ 6.     │ Service ACTIVE, responseStatus = OK                    │ ONLINE         │
 * │ 7.     │ Service INACTIVE, ND conditions apply                  │ N_D            │
 * │ 8.     │ Service INACTIVE, valid response                       │ OFFLINE        │
 * │ 9.     │ Invalid interop state                                  │ throws Error   │
 * └────────┴────────────────────────────────────────────────────────┴────────────────┘
 *
 * These scenarios verify that the telemetry state mapping logic correctly
 * transforms service-level and probing data into monitor states, as defined by:
 * - The probing enablement flag
 * - Availability of lastRequest and responseReceived
 * - Response freshness vs pollingFrequency
 * - Response status (OK/KO)
 * - Interop service state (ACTIVE/INACTIVE)
 */

import { describe, it, expect, vi, afterAll } from "vitest";
import {
  EserviceInteropState,
  eserviceInteropState,
  eserviceMonitorState,
  responseStatus,
} from "pagopa-interop-probing-models";
import { fromEPDToMonitorState } from "../src/utilities/enumUtils.js";

vi.mock("../src/utilities/config.js", () => ({
  config: { minOfTolleranceMultiplier: 1 },
}));

const now = new Date();
const minutesAgo = (m: number) =>
  new Date(now.getTime() - m * 60 * 1000).toISOString();
const minutesAhead = (m: number) =>
  new Date(now.getTime() + m * 60 * 1000).toISOString();

afterAll(() => {
  vi.resetModules();
});

describe("fromEPDToMonitorState", () => {
  it.each([
    {
      description: "should return N_D when probing is disabled",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: false,
        pollingFrequency: 5,
        lastRequest: now.toISOString(),
        responseReceived: now.toISOString(),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description: "should return N_D when lastRequest is missing",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: null,
        responseReceived: now.toISOString(),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return N_D when responseReceived is older than lastRequest and lastRequest is too old",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(120),
        responseReceived: minutesAgo(200),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description: "should return N_D when responseReceived is missing",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: now.toISOString(),
        responseReceived: null,
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return ONLINE when responseReceived is newer than lastRequest (fresh response)",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(5),
        responseReceived: minutesAhead(1),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState.online,
    },
    {
      description: "should return OFFLINE when responseStatus is KO",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: now.toISOString(),
        responseReceived: now.toISOString(),
        responseStatus: responseStatus.ko,
      },
      expected: eserviceMonitorState.offline,
    },
    {
      description: "should return ONLINE when responseStatus is OK",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: now.toISOString(),
        responseReceived: now.toISOString(),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState.online,
    },
    {
      description:
        "should return N_D when service is inactive and ND conditions apply",
      data: {
        state: eserviceInteropState.inactive,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: null,
        responseReceived: null,
        responseStatus: null,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description: "should return OFFLINE when service is inactive but not N_D",
      data: {
        state: eserviceInteropState.inactive,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: now.toISOString(),
        responseReceived: now.toISOString(),
        responseStatus: responseStatus.ko,
      },
      expected: eserviceMonitorState.offline,
    },
  ])("$description", ({ data, expected }) => {
    const result = fromEPDToMonitorState(data);
    expect(result).toBe(expected);
  });

  it("should throw an error for invalid interop state", () => {
    expect(() =>
      fromEPDToMonitorState({
        state: "INVALID_STATE" as unknown as EserviceInteropState,
        probingEnabled: true,
        pollingFrequency: 5,
      }),
    ).toThrowError(/Invalid state/);
  });
});
