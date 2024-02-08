export const sqsMessages = {
  messageBadFormattedResponseReceived: {
    eserviceRecordId: 1,
    responseReceived: "2023-04-06",
    status: "OK",
  },
  messageChangeResponseReceivedDto: {
    eserviceRecordId: 1,
    responseReceived: "2023-04-06T10:30:15.995Z",
    status: "OK",
  },
  messageChangeResponseReceivedEmpty: {},
  messageChangeResponseReceivedNoEserviceRecordId: {
    responseReceived: "2023-04-06T10:30:15.995Z",
    status: "OK",
  },
  messageChangeResponseReceivedNoResponseReceived: {
    eserviceRecordId: 1,
    status: "OK",
  },
  messageChangeResponseReceivedNoStatus: {
    eserviceRecordId: 1,
    responseReceived: "2023-04-06T10:30:15.995Z",
  },
} as const;
