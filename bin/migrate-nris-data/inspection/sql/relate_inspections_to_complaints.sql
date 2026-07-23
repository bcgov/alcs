alter table
    nris.inspection
add
    constraint fk_inspection_complaint foreign key (related_records) references nris.complaint(record_id);