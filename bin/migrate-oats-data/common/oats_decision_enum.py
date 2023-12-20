from enum import Enum


class AlcsDecisionOutcomeCodeEnum(Enum):
    RESCINDED = "RESC"
    REFUSED = "REFU"
    APPROVED = "APPR"


class AlcsNoiModificationOutcomeCodeEnum(Enum):
    PENDING = "PEN"
    PROCEED_TO_MODIFY = "PRC"
    REFUSE_TO_MODIFY = "REF"
