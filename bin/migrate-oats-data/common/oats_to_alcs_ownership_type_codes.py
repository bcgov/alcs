from enum import Enum


class ALCSOwnershipType(Enum):
    FeeSimple = "SMPL"
    Crown = "CRWN"


class OatsToAlcsOwnershipType(Enum):
    FEE = ALCSOwnershipType.FeeSimple.value
    CROWN = ALCSOwnershipType.Crown.value
    FIRST = ALCSOwnershipType.FeeSimple.value
