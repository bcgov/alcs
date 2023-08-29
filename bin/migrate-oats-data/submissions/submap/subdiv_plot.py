def get_subdiv_rows(rows, cursor):
    # fetches subdivision_data 
    component_ids = [dict(item)["alr_appl_component_id"] for item in rows]
    component_ids_string = ', '.join(str(item) for item in component_ids)   
    subdiv_rows_query = f"""
                        SELECT 
                            spi.alr_appl_component_id, spi.parcel_area, spi.subdiv_design_parcel_id
                        FROM
	                        oats.oats_subdiv_parcel_intents spi
                        WHERE spi.alr_appl_component_id in ({component_ids_string})
                        """
    cursor.execute(subdiv_rows_query)
    subdiv_rows = cursor.fetchall()
    return subdiv_rows

def create_subdiv_dict(subdiv_rows):
    # creates dictionary of subdivision parcel data with all subdivision attributed to one application component id
    alr_id = 'alr_appl_component_id'
    area = 'parcel_area'
    lot = 'Lot'
    parcel_type = 'type'
    size = 'size'

    subdiv_dict = {}
    for row in subdiv_rows:
        app_component_id = row[alr_id]
        
        if app_component_id in subdiv_dict:
                subdiv_dict[app_component_id].append({size: row[area], parcel_type: lot})

        else:
            subdiv_dict[app_component_id] = []
            subdiv_dict[app_component_id].append({size: row[area], parcel_type: lot})
    return subdiv_dict
            
def add_subdiv(data,json):
    # inserts null valued json string
    insert_string = []
    json_string = json.dumps(insert_string)
    data['subd_proposed_lots'] = json_string
    return data

def map_subdiv_lots(data, subdiv_data, json):
    # updates json string for applications with subdivision data
    insert_string = subdiv_data[data['alr_appl_component_id']]
    json_string = json.dumps(insert_string)
    data['subd_proposed_lots'] = json_string
    return data