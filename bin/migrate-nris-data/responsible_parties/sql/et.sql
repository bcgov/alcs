select
  'Property Owner'::alcs."compliance_and_enforcement_responsible_party_party_type_enum" as party_type,
  nc.foippa_type::alcs."compliance_and_enforcement_responsible_party_foippa_category_en" as foippa_category,
  false as is_previous,
  case
    when nc.foippa_type = 'Organization' then nc.submission_property_owner::text
  end as organization_name,
  case
    when nc.foippa_type <> 'Organization' then nc.submission_property_owner::text
  end as individual_name,
  ace.uuid as file_uuid
from
  nris.complaint nc
  join alcs.compliance_and_enforcement ace on ace.file_number = nc.record_id