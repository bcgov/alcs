SELECT
    ac."uuid",
    pr2.open,
    ac.status_code
FROM
    alcs.planning_referral pr
    JOIN alcs.card ac ON pr.card_uuid = ac."uuid"
    JOIN alcs.planning_review pr2 ON pr.planning_review_uuid = pr2."uuid"