
def add_direction_field(data):
    data['east_land_use_type_description'] = None
    data['east_land_use_type'] = None    
    data['west_land_use_type_description'] = None
    data['west_land_use_type'] = None   
    data['north_land_use_type_description'] = None
    data['north_land_use_type'] = None   
    data['south_land_use_type_description'] = None
    data['south_land_use_type'] = None   
    return data

def map_direction_field(data, dir_data):
    if data['alr_application_id'] == dir_data['alr_application_id']:
        if dir_data['cardinal_direction'] == 'EAST':
            data['east_land_use_type_description'] = dir_data['description']
            data['east_land_use_type'] = dir_data['nonfarm_use_type_code']
        if dir_data['cardinal_direction'] == 'WEST':
            data['west_land_use_type_description'] = dir_data['description']
            data['west_land_use_type'] = dir_data['nonfarm_use_type_code']
        if dir_data['cardinal_direction'] == 'NORTH':
            data['north_land_use_type_description'] = dir_data['description']
            data['north_land_use_type'] = dir_data['nonfarm_use_type_code']
        if dir_data['cardinal_direction'] == 'SOUTH':
            data['south_land_use_type_description'] = dir_data['description']
            data['south_land_use_type'] = dir_data['nonfarm_use_type_code']
    else:
        return data
    return data

# def map_dict_field(data, NESW)
#     if data[]