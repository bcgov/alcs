from enum import Enum
from .alcs_planning_review_enum import (
    AlcsPlanningReviewTypes,
    AlcsPlanningReviewOutcomes,
)


class OatsToAlcsPlanningReviewType(Enum):
    OCPRV = "OCPP"
    ZONERV = "ZBPP"
    LGBOUND = "BAPP"
    TRANSRV = "TPPP"
    PARKS = "PARK"
    REGGRO = "RGSP"
    CROWN = "CLUP"
    ALRBOUND = "ALRB"
    MISC = "MISC"
    UTIL = "UEPP"
    AAP = "AAPP"
    APC = "MISC"


class OatsToAlcsDecisionOutcomes(Enum):
    END = AlcsPlanningReviewOutcomes.ENDO.value
    NOTEND = AlcsPlanningReviewOutcomes.NEND.value
    PART = AlcsPlanningReviewOutcomes.PEND.value
    UNC = AlcsPlanningReviewOutcomes.OTHR.value
