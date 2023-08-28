def get_subdiv_rows(rows, cursor):
    # fetches subdivision_data, 
    component_ids = [dict(item)["alr_appl_component_id"] for item in rows]
    component_ids_string = ', '.join(str(item) for item in component_ids)
    # print(component_ids_string)    
    subdiv_rows_query = f"""
                        SELECT 
                            spi.alr_appl_component_id, spi.parcel_area, road_dedication_area, spi.subdiv_design_parcel_id
                        FROM
	                        oats.oats_subdiv_parcel_intents spi
	                        LEFT JOIN oats.oats_subdivision_designs sd ON spi.alr_appl_component_id = sd.alr_appl_component_id
	                        LEFT JOIN oats.oats_subdiv_design_parcels sdp ON spi.subdiv_design_parcel_id = sdp.subdiv_design_parcel_id     
                        WHERE spi.alr_appl_component_id in ({component_ids_string})
                        """
    # print(subdiv_rows_query)
    cursor.execute(subdiv_rows_query)
    subdiv_rows = cursor.fetchall()
    # print(subdiv_rows)
    return subdiv_rows

def create_subdiv_dict(subdiv_rows):
    # creates dictionary of adjacent land use data with all directions attributed to one application id
    alr_id = 'alr_appl_component_id'
    parcel_design_id = 'subdiv_design_parcel_id'
    area = 'parcel_area'
    lot = 'Lot'
    parcel_type = 'type'
    size = 'size'

    subdiv_dict = {}
    for row in subdiv_rows:
        app_component_id = row[alr_id]
        
        if app_component_id in subdiv_dict:
            # if row[parcel_design_id] not in subdiv_dict[app_component_id]:
                subdiv_dict[app_component_id].append({size: row[area], parcel_type: lot})
            #     print("in the loop")
            # print(subdiv_dict[app_component_id])
            # print("updated row")

        else:
            subdiv_dict[app_component_id] = []
            if row['road_dedication_area'] is not None:
                subdiv_dict[app_component_id].append({size: row['road_dedication_area'], parcel_type: 'Road Dedication'})
            subdiv_dict[app_component_id].append({size: row[area], parcel_type: lot})
    return subdiv_dict
            
def add_subdiv(data,json):
    insert_string = []
    json_string = json.dumps(insert_string)
    data['subd_proposed_lots'] = json_string
    return data

def map_subdiv_lots(data, subdiv_data, json):
    insert_string = subdiv_data[data['alr_appl_component_id']]
    # print(insert_string)
    json_string = json.dumps(insert_string)
    data['subd_proposed_lots'] = json_string
    # print('to json')
    # print(data['subd_proposed_lots'])
    return data