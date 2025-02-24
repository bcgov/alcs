export enum InstrumentType {
  BANK_DRAFT = 'Bank Draft',
  CERTIFIED_CHEQUE = 'Certified Cheque',
  EFT = 'EFT',
  IRREVOCABLE_LETTER_OF_CREDIT = 'Irrevocable Letter of Credit',
  OTHER = 'Other',
  SAFEKEEPING_AGREEMENT = 'Safekeeping Agreement',
}

export enum HeldBy {
  ALC = 'ALC',
  MINISTRY = 'Ministry',
}

export enum InstrumentStatus {
  RECEIVED = 'Received',
  RELEASED = 'Released',
  CASHED = 'Cashed',
  REPLACED = 'Replaced',
}

export interface DecisionConditionFinancialInstrumentDto {
  uuid: string;
  securityHolderPayee: string;
  type: InstrumentType;
  issueDate: number;
  expiryDate?: number | null;
  amount: number;
  bank: string;
  instrumentNumber?: string | null;
  heldBy: HeldBy;
  receivedDate: number;
  notes?: string | null;
  status: InstrumentStatus;
  statusDate?: number | null;
  explanation?: string | null;
}

export interface CreateUpdateDecisionConditionFinancialInstrumentDto {
  securityHolderPayee: string;
  type: InstrumentType;
  issueDate: number;
  expiryDate?: number | null;
  amount: number;
  bank: string;
  instrumentNumber?: string | null;
  heldBy: HeldBy;
  receivedDate: number;
  notes?: string | null;
  status: InstrumentStatus;
  statusDate?: number | null;
  explanation?: string | null;
}
