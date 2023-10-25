def get_app_status_type(cursor):
    query = f"""SELECT code from 
                        alcs.application_submission_status_type 
                        """
    cursor.execute(query)
    status_rows = cursor.fetchall()
    return status_rows


def get_app_status_count(cursor):
    query = f"""SELECT count(*) from 
                        alcs.application_submission_status_type 
                        """
    cursor.execute(query)
    count_rows = cursor.fetchall()
    return count_rows


def make_rows(types, rows):
    alr_id = "alr_application_id"
    type_dict = {}
    for row in rows:
        for stat in types:
            app_id = row[alr_id]
            if app_id in type_dict:
                type_dict[app_id].append(
                    {"status_type_code": stat["code"], "submission_uuid": row["uuid"]}
                )

            else:
                type_dict[app_id] = []
                type_dict[app_id].append(
                    {"status_type_code": stat["code"], "submission_uuid": row["uuid"]}
                )
    return type_dict
