/**
 * Tests for fromEPDToMonitorState()
 *
 * Covered scenarios:
 *
 * ┌────────┬───────────────────────────────────────────────────────────────────────┬────────────────┐
 * │ Case # | Condition Summary                                                     │ Expected State │
 * ├────────┼───────────────────────────────────────────────────────────────────────┼────────────────┤
 * │ 1.     │ ACTIVE E-Service, probing disabled                                    │ N_D            │
 * │ 2.     │ ACTIVE E-Service, missing lastRequest                                 │ N_D            │
 * │ 3.     │ ACTIVE E-Service, missing responseReceived                            │ N_D            │
 * │ 4.     │ ACTIVE E-Service, lastRequest too old (beyond tolerance threshold)    │ N_D            │
 * │ 5.     │ ACTIVE E-Service, responseReceived earlier than lastRequest           │ N_D            │
 * │ 6.     │ ACTIVE E-Service, responseStatus = KO                                 │ OFFLINE        │
 * │ 7.     │ INACTIVE E-Service                                                    │ OFFLINE        │
 * │ 8.     │ ACTIVE E-Service, responseStatus = OK with valid telemetry            │ ONLINE         │
 * └────────┴───────────────────────────────────────────────────────────────────────┴────────────────┘
 *
 * State Definitions:
 *
 * - N_D:
 *     The e-service state cannot be determined because telemetry is invalid:
 *       • too much time has passed since the last request (beyond failure tolerance)
 *       • lastRequest is missing (NULL)
 *       • responseReceived is missing (NULL)
 *       • probingEnabled = false
 *       • the timestamp of the last received response is earlier than the timestamp of
 *         the last sent request
 *
 * - OFFLINE:
 *     The latest response failed (status = KO) and telemetry is valid, OR
 *     the e-service interop state is INACTIVE.
 *
 * - ONLINE:
 *     The latest response is OK (status = OK) and telemetry is valid.
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
      description: "should return N_D when lastRequest is too old",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(120),
        responseReceived: minutesAgo(110),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return N_D when responseReceived is earlier than lastRequest",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(5),
        responseReceived: minutesAgo(10),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return N_D when responseStatus is OK but telemetry is invalid",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(120),
        responseReceived: minutesAgo(119),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return N_D when responseStatus is KO but telemetry is invalid",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(120),
        responseReceived: minutesAgo(119),
        responseStatus: responseStatus.ko,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description: "should return N_D when responseReceived equals lastRequest",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(5),
        responseReceived: minutesAgo(5),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState["n_d"],
    },
    {
      description:
        "should return OFFLINE when responseStatus is KO and telemetry is valid",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(3),
        responseReceived: minutesAgo(1),
        responseStatus: responseStatus.ko,
      },
      expected: eserviceMonitorState.offline,
    },
    {
      description: "should return OFFLINE when service is inactive",
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
    {
      description:
        "should return ONLINE when responseStatus is OK with valid telemetry",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(3),
        responseReceived: minutesAgo(1),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState.online,
    },
    {
      description:
        "should return ONLINE when responseStatus is OK just within threshold",
      data: {
        state: eserviceInteropState.active,
        probingEnabled: true,
        pollingFrequency: 5,
        lastRequest: minutesAgo(4),
        responseReceived: minutesAgo(1),
        responseStatus: responseStatus.ok,
      },
      expected: eserviceMonitorState.online,
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
    ).toThrowError(/no pattern matches value "INVALID_STATE"/);
  });
});
