const mockSend = jest.fn().mockReturnThis();
const mockStatus = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
  code: jest.fn().mockReturnThis(),
  status: mockStatus,
}));
const mockGetRequest = jest.fn().mockImplementation(() => ({
  url: 'someUrl',
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

export {
  mockSend,
  mockStatus,
  mockGetResponse,
  mockHttpArgumentsHost,
  mockArgumentsHost,
  mockGetRequest,
};
