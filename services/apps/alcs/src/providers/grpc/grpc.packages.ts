import { ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME } from '../../application-grpc/alcs-application.message.interface';
import { ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME } from '../../application-grpc/application-document-grpc/alcs-application-document.message.interface';
import { ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME } from '../../document-grpc/alcs-document.message.interface';

export const grpcPackagesNames: string[] = [
  ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME,
  ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
  ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME,
];
