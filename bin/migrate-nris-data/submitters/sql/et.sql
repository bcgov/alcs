select
  distinct ace.date_opened as date_added,
  nc.submitter::text as name,
  coalesce(nc.submitter_email::text, '')::text as email,
  coalesce(nc.submitter_phone::text, '')::text as telephone_number,
  coalesce(nc.affiliation, '')::text as affiliation,
  coalesce(nc.additional_contact_info, '')::text as additional_contact_information,
  ace.uuid::uuid as file_uuid
from
  nris.complaint nc
  join alcs.compliance_and_enforcement ace on ace.file_number = nc.record_id