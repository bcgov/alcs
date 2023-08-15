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


class OatsCapabilitySourceCode(Enum):
    BCLI = "BCLI"
    CLI = "CLI"
    ONSI = "ONSI"


class OatsAgriCapabilityCodes(Enum):
    P = "P"
    PD = "PD"
    MIX = "MIX"
    S = "S"
    U = "U"

class OatsLegislationCodes(Enum):
    SEC_30_1 = "SEC_30_1"
    SEC_29_1 = "SEC_29_1"
    SEC_17_3 = "SEC_17_3"
    SEC_17_1 = "SEC_17_1"

OATS_NFU_SUBTYPES = [
        {"type_key": "AGR", "subtype_key": "1", "value": "Accessory Buildings"},
        {"type_key": "RES", "subtype_key": "2", "value": "Additional Dwelling(s)"},
        {
            "type_key": "AGR",
            "subtype_key": "3",
            "value": "Additional Structures for Farm Help",
        },
        {
            "type_key": "AGR",
            "subtype_key": "4",
            "value": "Agricultural Land Use Remnant",
        },
        {"type_key": "AGR", "subtype_key": "5", "value": "Agricultural Lease"},
        {
            "type_key": "AGR",
            "subtype_key": "6",
            "value": "Agricultural Subdivision Remnant",
        },
        {
            "type_key": "TRA",
            "subtype_key": "7",
            "value": "Airports and Aviation related",
        },
        {"type_key": "IND", "subtype_key": "8", "value": "Alcohol Processing"},
        {
            "type_key": "COM",
            "subtype_key": "9",
            "value": "Animal Boarding and Services",
        },
        {"type_key": "COM", "subtype_key": "11", "value": "Auto Services"},
        {"type_key": "AGR", "subtype_key": "12", "value": "Beef"},
        {
            "type_key": "COM",
            "subtype_key": "13",
            "value": "Campground (Private) & RV Park",
        },
        {"type_key": "COM", "subtype_key": "14", "value": "Care Facilities"},
        {
            "type_key": "IND",
            "subtype_key": "15",
            "value": "Cement/ Asphalt/Concrete Plants",
        },
        {"type_key": "CIV", "subtype_key": "16", "value": "Cemeteries"},
        {"type_key": "CIV", "subtype_key": "17", "value": "Churches & Bible Schools"},
        {"type_key": "CIV", "subtype_key": "18", "value": "Civic - other"},
        {
            "type_key": "CIV",
            "subtype_key": "19",
            "value": "Civic Facilities and Buildings",
        },
        {"type_key": "COM", "subtype_key": "20", "value": "Commercial - other"},
        {"type_key": "IND", "subtype_key": "21", "value": "Composting"},
        {"type_key": "AGR", "subtype_key": "22", "value": "Dairy"},
        {
            "type_key": "IND",
            "subtype_key": "23",
            "value": "Deposition/Fill (All Types)",
        },
        {"type_key": "COM", "subtype_key": "24", "value": "Golf Course"},
        {"type_key": "AGR", "subtype_key": "25", "value": "Grain & Forage"},
        {
            "type_key": "TRA",
            "subtype_key": "25",
            "value": "Electrical Power Distribution Systems",
        },
        {"type_key": "AGR", "subtype_key": "26", "value": "Greenhouses"},
        {
            "type_key": "TRA",
            "subtype_key": "26",
            "value": "Electrical Power Facilities",
        },
        {"type_key": "COM", "subtype_key": "28", "value": "Exhibitions and Festivals"},
        {
            "type_key": "RES",
            "subtype_key": "29",
            "value": "Subdivision Special Categories",
        },
        {"type_key": "COM", "subtype_key": "30", "value": "Food and Beverage Services"},
        {
            "type_key": "RES",
            "subtype_key": "30",
            "value": "Subdivision Special Categories (Lease)",
        },
        {"type_key": "IND", "subtype_key": "31", "value": "Food Processing (non-meat)"},
        {"type_key": "IND", "subtype_key": "32", "value": "Industrial - other"},
        {"type_key": "AGR", "subtype_key": "33", "value": "Land Use Remnant"},
        {"type_key": "AGR", "subtype_key": "34", "value": "Livestock-Unspecified"},
        {"type_key": "IND", "subtype_key": "35", "value": "Logging Operations"},
        {
            "type_key": "IND",
            "subtype_key": "36",
            "value": "Lumber Manufacturing and Re-manufacturing",
        },
        {
            "type_key": "IND",
            "subtype_key": "37",
            "value": "Meat and Fish Processing (+abattoir)",
        },
        {"type_key": "IND", "subtype_key": "38", "value": "Mining"},
        {"type_key": "AGR", "subtype_key": "39", "value": "Misc. Agricultural Use"},
        {"type_key": "AGR", "subtype_key": "40", "value": "Mixed Ag Uses"},
        {"type_key": "OTH", "subtype_key": "41", "value": "Mixed Uses"},
        {"type_key": "RES", "subtype_key": "42", "value": "Mobile Home Park"},
        {
            "type_key": "RES",
            "subtype_key": "43",
            "value": "Multi Family-Apartments/Condominiums",
        },
        {
            "type_key": "COM",
            "subtype_key": "44",
            "value": "Office Building (Primary Use)",
        },
        {"type_key": "IND", "subtype_key": "45", "value": "Oil and Gas Activities"},
        {"type_key": "OTH", "subtype_key": "46", "value": "Other Uses"},
        {"type_key": "AGR", "subtype_key": "47", "value": "Other-Undefined"},
        {"type_key": "REC", "subtype_key": "48", "value": "Parks & Playing Fields"},
        {
            "type_key": "CIV",
            "subtype_key": "49",
            "value": "Parks-All Types operated by Local Gov't",
        },
        {"type_key": "AGR", "subtype_key": "50", "value": "Pigs/Hogs"},
        {"type_key": "AGR", "subtype_key": "51", "value": "Poultry"},
        {
            "type_key": "TRA",
            "subtype_key": "52",
            "value": "Public Transportation Facilities",
        },
        {"type_key": "TRA", "subtype_key": "53", "value": "Railway"},
        {"type_key": "REC", "subtype_key": "54", "value": "Recreational - other"},
        {"type_key": "CIV", "subtype_key": "55", "value": "Research Facilities"},
        {"type_key": "RES", "subtype_key": "56", "value": "Residential - other"},
        {"type_key": "TRA", "subtype_key": "57", "value": "Roads"},
        {"type_key": "IND", "subtype_key": "58", "value": "Sand & Gravel"},
        {"type_key": "CIV", "subtype_key": "59", "value": "Sanitary Land Fills"},
        {"type_key": "CIV", "subtype_key": "60", "value": "Schools & Universities"},
        {
            "type_key": "TRA",
            "subtype_key": "61",
            "value": "Sewage Treatment Facilities",
        },
        {"type_key": "TRA", "subtype_key": "62", "value": "Sewer Distribution Systems"},
        {"type_key": "COM", "subtype_key": "63", "value": "Shopping Centre"},
        {"type_key": "AGR", "subtype_key": "64", "value": "Small Fruits-Berries"},
        {
            "type_key": "COM",
            "subtype_key": "65",
            "value": "Sports Facilities - commercial",
        },
        {
            "type_key": "REC",
            "subtype_key": "66",
            "value": "Sports Facilities - municipal",
        },
        {"type_key": "COM", "subtype_key": "67", "value": "Storage & Warehouse"},
        {"type_key": "COM", "subtype_key": "68", "value": "Store (Retail - All Types)"},
        {
            "type_key": "TRA",
            "subtype_key": "69",
            "value": "Telephone and Telecommunications",
        },
        {"type_key": "COM", "subtype_key": "70", "value": "Tourist Accommodations"},
        {"type_key": "REC", "subtype_key": "71", "value": "Trails"},
        {"type_key": "TRA", "subtype_key": "72", "value": "Transportation - other"},
        {"type_key": "AGR", "subtype_key": "73", "value": "Tree Fruits"},
        {"type_key": "AGR", "subtype_key": "74", "value": "Turf Farm"},
        {"type_key": "AGR", "subtype_key": "75", "value": "Vegetable & Truck"},
        {
            "type_key": "AGR",
            "subtype_key": "76",
            "value": "Vineyard and Associated Uses",
        },
        {"type_key": "TRA", "subtype_key": "77", "value": "Water Distribution Systems"},
        {
            "type_key": "TRA",
            "subtype_key": "78",
            "value": "Water or Sewer Distribution Systems (inactive)",
        },
        {"type_key": "TRA", "subtype_key": "79", "value": "Water Treatment Facilities"},
        {"type_key": "COM", "subtype_key": "80", "value": "Hall/Lodge (private)_"},
        {
            "type_key": "CIV",
            "subtype_key": "81",
            "value": "Hospitals, Health Centres (Incl Private)",
        },
        {"type_key": "RES", "subtype_key": "82", "value": "Farm Help Accommodation"},
        {
            "type_key": "TRA",
            "subtype_key": "27",
            "value": "Gas and Other Distribution Pipelines",
        },
        {"type_key": "AGR", "subtype_key": "23", "value": "Energy Production"},
        {"type_key": "IND", "subtype_key": "25", "value": "Energy Production"},
        {"type_key": "RES", "subtype_key": "83", "value": "Lease"},
        {
            "type_key": "IND",
            "subtype_key": "86",
            "value": "Storage and Warehouse Facilities (Indoor/Outdoor- Large Scale Structures)",
        },
        {
            "type_key": "IND",
            "subtype_key": "84",
            "value": "Work Camps or Associated Use",
        },
        {"type_key": "IND", "subtype_key": "85", "value": "Miscellaneous Processing"},
        {"type_key": "COM", "subtype_key": "87", "value": "Events"},
        {"type_key": "IND", "subtype_key": "88", "value": "Sawmill"},
        {
            "type_key": "CIV",
            "subtype_key": "89",
            "value": "Fire Hall and associated uses",
        },
        {
            "type_key": "AGR",
            "subtype_key": "90",
            "value": "Alcohol Production Associated Uses",
        },
        {"type_key": "AGR", "subtype_key": "91", "value": "Cannabis Related Uses"},
    ]