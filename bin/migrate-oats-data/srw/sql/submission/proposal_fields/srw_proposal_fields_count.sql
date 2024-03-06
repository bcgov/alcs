SELECT count(*)
FROM oats.oats_alr_applications oaa
    JOIN alcs.notification_submission nos ON nos.file_number = oaa.alr_application_id::TEXT
    LEFT JOIN alcs."user" au ON oaa.created_guid = au.bceid_guid