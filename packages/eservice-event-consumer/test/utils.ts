import {
  EServiceDescriptorV1,
  EServiceModeV1,
  EServiceTechnologyV1,
  EServiceV1,
  EServiceDescriptorStateV1,
  EServiceEventV1,
  AgreementApprovalPolicyV2,
  EServiceDescriptorStateV2,
  EServiceDescriptorV2,
  EServiceEventV2,
  EServiceV2,
  EServiceModeV2,
  EServiceTechnologyV2,
} from "@pagopa/interop-outbound-models";
import { v4 as uuidv4 } from "uuid";

const descriptorV1 = (): EServiceDescriptorV1 => ({
  id: uuidv4(),
  audience: ["test.audience"],
  dailyCallsPerConsumer: 100,
  dailyCallsTotal: 100,
  state: EServiceDescriptorStateV1.PUBLISHED,
  version: "1",
  voucherLifespan: 100,
  serverUrls: ["http://test.com"],
  docs: [],
});

export const createEServiceV1 = (
  partialEservice?: Partial<EServiceV1>,
  descriptorItem?: EServiceDescriptorV1,
): EServiceV1 => ({
  id: uuidv4(),
  producerId: uuidv4(),
  description: "eService test description",
  name: "eServie test name",
  mode: EServiceModeV1.RECEIVE,
  technology: EServiceTechnologyV1.REST,
  ...partialEservice,
  descriptors: [descriptorItem || descriptorV1()],
});

export const createEserviceAddedEventV1 = (
  eserviceV1: EServiceV1 | undefined,
  stream_id?: string,
  version?: number,
): EServiceEventV1 => ({
  type: "EServiceAdded",
  timestamp: new Date(),
  event_version: 1,
  version: version || 1,
  stream_id: stream_id || uuidv4(),
  data: {
    eservice: eserviceV1,
  },
});

export const mockEserviceDeleteV1: EServiceEventV1 = {
  event_version: 1,
  version: 1,
  type: "EServiceDeleted",
  timestamp: new Date(),
  stream_id: "1",
  data: {
    eserviceId: uuidv4(),
  },
};

export const mockEserviceDeleteV2: EServiceEventV2 = {
  event_version: 2,
  version: 1,
  type: "EServiceDeleted",
  timestamp: new Date(),
  stream_id: "1",
  data: {
    eserviceId: uuidv4(),
  },
};

export const mockEserviceUpdateV1: EServiceEventV1 = {
  event_version: 1,
  version: 1,
  type: "ClonedEServiceAdded",
  timestamp: new Date(),
  stream_id: "1",
  data: {
    eservice: {
      description: "",
      technology: EServiceTechnologyV1.REST,
      id: uuidv4(),
      name: "",
      producerId: uuidv4(),
      descriptors: [descriptorV1(), descriptorV1()],
    },
  },
};

export const createEserviceAddedEventV2 = (
  eServiceV2: EServiceV2,
  stream_id?: string,
  version?: number,
): EServiceEventV2 => ({
  type: "EServiceAdded",
  event_version: 2,
  stream_id: stream_id || uuidv4(),
  timestamp: new Date(),
  version: version || 1,
  data: {
    eservice: eServiceV2,
  },
});

export const getDescriptorV2 = (
  partialDescriptorV2?: Partial<EServiceDescriptorV2>,
): EServiceDescriptorV2 => ({
  id: uuidv4(),
  agreementApprovalPolicy: AgreementApprovalPolicyV2.AUTOMATIC,
  audience: ["test.audience"],
  createdAt: 1n,
  dailyCallsPerConsumer: 100,
  dailyCallsTotal: 100,
  rejectionReasons: [],
  docs: [],
  serverUrls: ["http://test.com"],
  state: EServiceDescriptorStateV2.DRAFT,
  version: 1n,
  voucherLifespan: 100,
  ...partialDescriptorV2,
});

export const createV2Event = (
  eServiceId: string,
  descriptorId: string,
  producerId: string,
  eServiceDescriptorState: EServiceDescriptorStateV2,
  descriptors?: EServiceDescriptorV2[],
): EServiceV2 => ({
  id: eServiceId,
  producerId,
  createdAt: 1n,
  description: "eService test description",
  mode: EServiceModeV2.RECEIVE,
  name: "eService test name",
  technology: EServiceTechnologyV2.REST,

  descriptors: descriptors
    ? descriptors
    : [
        getDescriptorV2({
          id: descriptorId,
          state: eServiceDescriptorState,
        }),
      ],
});

export const mockClonedEServiceAddedV1: EServiceEventV1 = {
  ...mockEserviceUpdateV1,
  type: "ClonedEServiceAdded",
};

export const mockEserviceCloneV2: EServiceEventV2 = {
  event_version: 2,
  version: 1,
  timestamp: new Date(),
  stream_id: "1",
  type: "EServiceCloned",
  data: {
    sourceDescriptorId: uuidv4(),
    eservice: {
      id: uuidv4(),
      producerId: uuidv4(),
      createdAt: "1" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      description: "eService test description",
      mode: 0,
      name: "eService test name",
      technology: 0,
      descriptors: [
        getDescriptorV2({
          id: uuidv4(),
          state: EServiceDescriptorStateV2.DRAFT,
        }),
        getDescriptorV2({
          id: uuidv4(),
          state: EServiceDescriptorStateV2.PUBLISHED,
        }),
      ],
    },
  },
};
