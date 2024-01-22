from enum import Enum
from .alcs_application_enum import AlcsApplicantType


class OatsLegislationCodesToAlcsApplicant(Enum):
    SEC_30_1 = AlcsApplicantType.Land_owner.value
    SEC_29_1 = AlcsApplicantType.LFNG.value
    SEC_17_3 = AlcsApplicantType.Land_owner.value
    SEC_17_1 = AlcsApplicantType.LFNG.value
