from enum import Enum


class AlcsNfuSubTypeCode(Enum):
    Alcohol_Processing = "Alcohol Processing"
    Cement_Asphalt_Concrete_Plants = "Cement / Asphalt / Concrete Plants"
    Commercial_Retail = "Commercial / Retail"
    Deposition_Fill = "Deposition / Fill (All Types)"
    Energy_Production = "Energy Production"
    Recreational = "Recreational"
    Food_Processing = "Food Processing (Non-Meat)"
    Industrial_Other = "Industrial - Other"
    Logging_Operations = "Logging Operations"
    Lumber_Manufacturing_Re_Manufacturing = "Lumber Manufacturing and Re-Manufacturing"
    Meat_Fish_Processing = "Meat and Fish Processing"
    Mining = "Mining"
    Miscellaneous_Processing = "Miscellaneous Processing"
    Oil_Gas_Activities = "Oil and Gas Activities"
    Sand_Gravel = "Sand & Gravel"
    Sawmill = "Sawmill"
    Storage_Warehouse_Facilities = (
        "Storage and Warehouse Facilities (Indoor/Outdoor - Large Scale Structures)"
    )
    Work_Camps_Associated_Use = "Work Camps or Associated Use"


class AlcsNfuTypeCode(Enum):
    Agricultural_Farm = "Agricultural / Farm"
    Civic_Institutional = "Civic / Institutional"
    Commercial_Retail = "Commercial / Retail"
    Industrial = "Industrial"
    Other = "Other"
    Recreational = "Recreational"
    Residential = "Residential"
    Transportation_Utilities = "Transportation / Utilities"
    Unused = "Unused"


class AlcsAgCap(Enum):
    Mixed_Prime_Secondary = "Mixed Prime and Secondary"
    Prime = "Prime"
    Prime_Dominant = "Prime Dominant"
    Secondary = "Secondary"
    Unclassified = "Unclassified"


class AlcsAgCapSource(Enum):
    BCLI = "BCLI"
    CLI = "CLI"
    On_site = "On-site"


class AlcsApplicantType(Enum):
    Land_owner = "Land Owner"
    LFNG = "L/FNG Initiated"


class AlcsNaruTypeCode(Enum):
    Principal_Residence = "PRIN"  # Principal Residence More Than 500m²
    Additional_Residence = "ARFU"  # Additional Residence for Farm Use
    Tourism_Accomodation = "TOUR"  # Non-Adhering Tourism Accommodation
