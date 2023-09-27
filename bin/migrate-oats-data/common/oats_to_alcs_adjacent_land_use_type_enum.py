from enum import Enum


class AlcsAdjacentLandUseType(Enum):
    AGR = "Agricultural / Farm"
    CIV = "Civic / Institutional"
    COM = "Commercial / Retail"
    IND = "Industrial"
    OTH = "Other"
    REC = "Recreational"
    RES = "Residential"
    TRA = "Transportation / Utilities"
    UNU = "Unused"


class AdjacentLandUseDirections(Enum):
    NORTH = "NORTH"
    SOUTH = "SOUTH"
    WEST = "WEST"
    EAST = "EAST"
