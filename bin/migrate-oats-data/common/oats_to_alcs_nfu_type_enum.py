from enum import Enum
from .alcs_application_enum import AlcsNfuTypeCode


class OatsToAlcsNfuTypes(Enum):
    AGR = AlcsNfuTypeCode.Agricultural_Farm.value
    CIV = AlcsNfuTypeCode.Civic_Institutional.value
    COM = AlcsNfuTypeCode.Commercial_Retail.value
    IND = AlcsNfuTypeCode.Industrial.value
    OTH = AlcsNfuTypeCode.Other.value
    REC = AlcsNfuTypeCode.Recreational.value
    RES = AlcsNfuTypeCode.Residential.value
    TRA = AlcsNfuTypeCode.Transportation_Utilities.value
    UNU = AlcsNfuTypeCode.Unused.value
