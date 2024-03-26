export interface InquiryParcelDto {
  uuid: string;
  inquiryUuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress: string;
}

export interface InquiryParcelCreateDto {
  civicAddress: string;
  pid?: string | null;
  pin?: string | null;
}

export interface InquiryParcelUpdateDto {
  uuid: string;
  pid?: string | null;
  pin?: string | null;
  civicAddress: string;
}
