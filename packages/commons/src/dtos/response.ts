export interface ListEservices {
  content: Object[];
  offset: string;
  limit: string;
  totalElements: string;
}

export interface EService {
  eserviceRecordId: number;
  eserviceName: string;
  producerName: string;
  responseReceived: string;
  state: string;
  versionNumber: number;
}

export interface ListProducers {
  label: string;
  value: string;
}

export interface UpdateStateResponse {}

export interface updateProbingState {}

export interface getProbingDataByRecordId {
}

export interface getMainDataByRecordId {
}
