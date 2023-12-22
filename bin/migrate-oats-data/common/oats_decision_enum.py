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
