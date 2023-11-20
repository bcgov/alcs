SELECT DISTINCT
    oaa.created_guid
FROM
    oats.oats_alr_applications oaa
WHERE
    oaa.created_guid IS NOT NULL