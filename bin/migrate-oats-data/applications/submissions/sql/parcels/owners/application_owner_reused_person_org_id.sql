-- finds and returns person_organization_ids reused in alr_applications of class app
WITH oats_joined_with_alcs_owners_with_parcels AS (
    SELECT appp.oats_subject_property_id,
        opo.person_organization_id
    FROM oats.OATS_SUBJECT_PROPERTIES osp
        LEFT JOIN oats.OATS_PROPERTY_INTERESTS opi ON osp.SUBJECT_PROPERTY_ID = opi.SUBJECT_PROPERTY_ID
        JOIN alcs.application_parcel appp ON appp.oats_subject_property_id = osp.subject_property_id
        LEFT JOIN oats.OATS_PERSON_ORGANIZATIONS opo ON opo.PERSON_ORGANIZATION_ID = opi.PERSON_ORGANIZATION_ID
    WHERE opi.person_organization_id IS NOT NULL
        AND opo.person_organization_id IS NOT NULL
    GROUP BY appp.oats_subject_property_id,
        opo.person_organization_id
    ORDER BY oats_subject_property_id,
        person_organization_id
),
person_organization_ids_with_count AS (
    SELECT count(*),
        oatsp.person_organization_id
    FROM oats_joined_with_alcs_owners_with_parcels oatsp
        LEFT JOIN alcs.application_owner appo ON appo.oats_person_organization_id = oatsp.person_organization_id
    GROUP BY oatsp.person_organization_id
    HAVING count(*) > 1
    ORDER BY count(*) DESC
),
oats_owners_with_parcels AS (
    SELECT opo.person_organization_id
    FROM oats.OATS_SUBJECT_PROPERTIES osp
        LEFT JOIN oats.OATS_PROPERTY_INTERESTS opi ON osp.SUBJECT_PROPERTY_ID = opi.SUBJECT_PROPERTY_ID
        LEFT JOIN oats.OATS_PERSON_ORGANIZATIONS opo ON opo.PERSON_ORGANIZATION_ID = opi.PERSON_ORGANIZATION_ID
    WHERE opi.person_organization_id IS NOT NULL
        AND opo.person_organization_id IS NOT NULL
    GROUP BY opo.person_organization_id
    ORDER BY person_organization_id
)
SELECT count(*),
    oatsp.person_organization_id
FROM oats_owners_with_parcels oatsp
    LEFT JOIN alcs.application_owner appo ON appo.oats_person_organization_id = oatsp.person_organization_id
    JOIN person_organization_ids_with_count poidc ON poidc.person_organization_id = oatsp.person_organization_id
GROUP BY oatsp.person_organization_id
HAVING power(count(*), 2) != max(poidc."count") -- this will provide all person_organization_ids reused for multiple alr_application_ids of class app. max will not affect anything since it is only 1 record per person_organization_id
ORDER BY count(*) DESC;