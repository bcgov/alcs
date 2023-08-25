
def add_direction_field(data):
    # populates columns to be inserted 
    data['east_land_use_type_description'] = None
    data['east_land_use_type'] = None    
    data['west_land_use_type_description'] = None
    data['west_land_use_type'] = None   
    data['north_land_use_type_description'] = None
    data['north_land_use_type'] = None   
    data['south_land_use_type_description'] = None
    data['south_land_use_type'] = None   
    return data

def get_directions_rows(rows, cursor):
    # fetches adjacent land use data, specifically direction, description and type code
    application_ids = [dict(item)["alr_application_id"] for item in rows]
    application_ids_string = ', '.join(str(item) for item in application_ids)    
    adj_rows_query = f"""SELECT * from 
                        oats.oats_adjacent_land_uses oalu 
                        WHERE oalu.alr_application_id in ({application_ids_string})
                        """
    cursor.execute(adj_rows_query)
    adj_rows = cursor.fetchall()
    return adj_rows

def map_direction_values(data, direction_data):
    # adds direction field values into data row
    no_data = 'No data found'
    app_id = "alr_application_id"
    data['east_land_use_type_description'] = direction_data.get(data[app_id], {}).get('east_description', no_data)
    data['east_land_use_type'] = direction_data.get(data[app_id], {}).get('east_type_code', None)
    data['west_land_use_type_description'] = direction_data.get(data[app_id], {}).get('west_description', no_data)
    data['west_land_use_type'] = direction_data.get(data[app_id], {}).get('west_type_code', None)
    data['north_land_use_type_description'] = direction_data.get(data[app_id], {}).get('north_description', no_data)
    data['north_land_use_type'] = direction_data.get(data[app_id], {}).get('north_type_code', None)    
    data['south_land_use_type_description'] = direction_data.get(data[app_id], {}).get('south_description', no_data)
    data['south_land_use_type'] = direction_data.get(data[app_id], {}).get('south_type_code', None)
    return data

def create_direction_dict(adj_rows):
    # creates dictionary of adjacent land use data with all directions attributed to one application id
    compass = 'cardinal_direction'
    description = 'description'
    type_code = 'nonfarm_use_type_code'
    alr_id = 'alr_application_id'
    direction_dict = {}
    for row in adj_rows:
        application_id = row[alr_id]

        if application_id in direction_dict:
            if row[compass] == 'EAST':
                direction_dict[application_id]['east_description'] = row[description]
                direction_dict[application_id]['east_type_code'] = row[type_code]
            if row[compass] == 'WEST':
                direction_dict[application_id]['west_description'] = row[description]
                direction_dict[application_id]['west_type_code'] = row[type_code]
            if row[compass] == 'NORTH':
                direction_dict[application_id]['north_description'] = row[description]
                direction_dict[application_id]['north_type_code'] = row[type_code]
            if row[compass] == 'SOUTH':
                direction_dict[application_id]['south_description'] = row[description]
                direction_dict[application_id]['south_type_code'] = row[type_code]
        else:
            direction_dict[application_id] = {}
            direction_dict[application_id][alr_id] = row[alr_id]

            if row[compass] == 'EAST':
                direction_dict[application_id]['east_description'] = row[description]
                direction_dict[application_id]['east_type_code'] = row[type_code]
            if row[compass] == 'WEST':
                direction_dict[application_id]['west_description'] = row[description]
                direction_dict[application_id]['west_type_code'] = row[type_code]
            if row[compass] == 'NORTH':
                direction_dict[application_id]['north_description'] = row[description]
                direction_dict[application_id]['north_type_code'] = row[type_code]
            if row[compass] == 'SOUTH':
                direction_dict[application_id]['south_description'] = row[description]
                direction_dict[application_id]['south_type_code'] = row[type_code]

    return direction_dict