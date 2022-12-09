import { ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME } from '../../alcs/application-grpc/alcs-application.message.interface';
import { ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME } from '../../alcs/application-grpc/application-document/alcs-application.message.interface';
import { ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME } from '../../alcs/document-grpc/alcs-document.message.interface';

export const grpcPackagesNames: string[] = [
  ALCS_APPLICATION_PROTOBUF_PACKAGE_NAME,
  ALCS_APPLICATION_DOCUMENT_PROTOBUF_PACKAGE_NAME,
  ALCS_DOCUMENT_PROTOBUF_PACKAGE_NAME,
];
