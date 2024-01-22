from enum import Enum

LAST_IMPORTED_APPLICATION_FILE = "last_imported_application_file.txt"
LAST_IMPORTED_PLANNING_FILE = "last_imported_planning_file.txt"
LAST_IMPORTED_ISSUE_FILE = "last_imported_issue_file.txt"


class DocumentUploadBasePath(Enum):
    APPLICATION = "migrate/application"
    PLANNING = "migrate/planning_review"
    ISSUE = "migrate/issue"


class EntityType(Enum):
    APPLICATION = "application"
    PLANNING = "planning review"
    ISSUE = "issue"
