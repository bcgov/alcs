WITH
    app_fee AS (
        SELECT
            oa.applied_fee_amt AS fee_amount,
            oa.fee_waived_ind AS fee_waived,
            split_fee_with_local_gov_ind AS fee_split_with_lg,
            oa.alr_application_id AS app_id
        FROM
            oats.oats_alr_applications oa
            JOIN alcs.application aa ON aa.file_number = oa.alr_application_id :: TEXT
        WHERE aa.fee_amount IS NULL  -- Newly imported applications will have NULL values for fee_amount, will not update existing values
    )
SELECT
    *
FROM
    app_fee af