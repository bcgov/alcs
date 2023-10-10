from enum import Enum
from common import AlcsNaruTypeCode


class OatsToAlcsNaruType(Enum):
    PRL = AlcsNaruTypeCode.Principal_Residence.value
    ADF = AlcsNaruTypeCode.Additional_Residence.value
    ATA = AlcsNaruTypeCode.Tourism_Accomodation.value
