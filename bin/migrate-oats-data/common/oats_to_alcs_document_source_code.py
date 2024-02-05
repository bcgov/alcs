from enum import Enum

class OatsDocumentSourceCode(Enum):
    APP = "APP"
    LG = "LG"
    ALC = "ALC"

class AlcsDocumentSourceCode(Enum):
    APPLICANT = "Applicant"
    ALC = "ALC"
    LFNG = "L/FNG"
    AFFECTED_PARTY = "Affected Party"
    PUBLIC = "Public"

class OatsToAlcsDocumentSourceCode(Enum):
    APP = AlcsDocumentSourceCode.APPLICANT.value
    LG = AlcsDocumentSourceCode.LFNG.value
    ALC = AlcsDocumentSourceCode.ALC.value