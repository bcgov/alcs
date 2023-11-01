SELECT count(*)
FROM alcs.notice_of_intent_submission nois
    JOIN oats.oats_subject_properties osp ON osp.alr_application_id::text = nois.file_number;