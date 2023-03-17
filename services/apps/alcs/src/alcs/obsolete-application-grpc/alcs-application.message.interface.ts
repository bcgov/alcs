export const ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME = 'alcs_application';

// Protobuf does not allow method without parameters so the only way is to specify interface without properties
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationFileNumberGenerateGrpcRequest {}

export interface ApplicationFileNumberGenerateGrpcResponse {
  fileNumber: string;
}
