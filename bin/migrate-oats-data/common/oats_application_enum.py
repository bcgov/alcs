from enum import Enum


class ALRChangeCode(Enum):
    TUR = "TUR"  # Transport, Utility, and Recreation
    INC = "INC"  # Inclusion
    EXC = "EXC"  # Exclusion
    SDV = "SDV"  # Subdivision
    NFU = "NFU"  # Non Farm Use
    SCH = "SCH"  # Extraction and Fill
    EXT = "EXT"  # Extraction
    FILL = "FILL"  # Fill
    SRW = "SRW"  # Notification of Statutory Right of Way
    CSC = "CSC"  # Conservation Covenant
    NAR = "NAR"  # Non-Adhering Residential Use
