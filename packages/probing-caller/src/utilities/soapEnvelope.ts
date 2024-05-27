export const createProbingRequestEnvelope = (): string => {
  return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:prob="http://it/pagopa/interop/probing">
          <soapenv:Header/>
          <soapenv:Body>
              <prob:probingRequest/>
          </soapenv:Body>
      </soapenv:Envelope>
  `;
};
