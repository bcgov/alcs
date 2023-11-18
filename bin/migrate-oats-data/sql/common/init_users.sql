SELECT
    oas.login,
    oas.alc_staff_id,
    oas.email,
    oas.first_name,
    oas.last_name
FROM
    oats.oats_alc_staffs oas
GROUP BY
    oas.login,
    oas.alc_staff_id