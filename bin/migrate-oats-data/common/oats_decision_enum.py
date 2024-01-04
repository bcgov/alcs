from enum import Enum
from .alcs_application_enum import AlcsAgCapSource, AlcsAgCap


class AlcsDecisionOutcomeCodeEnum(Enum):
    RESCINDED = "RESC"
    REFUSED = "REFU"
    APPROVED = "APPR"


class AlcsNoiModificationOutcomeCodeEnum(Enum):
    PENDING = "PEN"
    PROCEED_TO_MODIFY = "PRC"
    REFUSE_TO_MODIFY = "REF"


class OatsToAlcsAgCapSource(Enum):
    BCLI = AlcsAgCapSource.BCLI.value
    CLI = AlcsAgCapSource.CLI.value
    ONSI = AlcsAgCapSource.On_site.value


class OatsToAlcsAgCap(Enum):
    P = AlcsAgCap.Prime.value
    PD = AlcsAgCap.Prime_Dominant.value
    MIX = AlcsAgCap.Mixed_Prime_Secondary.value
    S = AlcsAgCap.Secondary.value
    U = AlcsAgCap.Unclassified.value


class OatsToAlcsConditionTypeMapping(Enum):
    ADO = "ACBO"
    ACC = "ACCE"
    ADF = "AFEE"
    BON = "BOND"
    BAG = "BTOA"
    BUF = "BUFF"
    CON = "CONS"
    RCV = "COVE"
    FEN = "FENC"
    RPF = "FRPT"
    HOS = "HOME"
    INC = "INCL"
    LEP = "LEAS"
    MON = "MBRP"
    NEX = "NOEX"
    NHS = "NOHS"
    # NONT no mapping for this one in OATS
    OTH = "OTHR"
    RHB = "RERC"
    RFR = "ROFR"
    PLN = "RSPL"
    SRP = "SCAR"
    SCO = "SCSP"
    STA = "SRPT"
    SIT = "SSDP"
    SRC = "STRC"
    TIM = "TIME"
    VGS = "VEGS"
