def get_subdiv_rows(rows, cursor):
    # fetches subdivision_data, 
    component_ids = [dict(item)["alr_appl_component_id"] for item in rows]
    component_ids_string = ', '.join(str(item) for item in component_ids)
    print(component_ids_string)    
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
    return subdiv_rows

def create_subdiv_dict(subdiv_rows):
    # creates dictionary of adjacent land use data with all directions attributed to one application id
    alr_id = 'alr_appl_component_id'
    parcel_design_id = 'subdiv_design_parcel_id'
    area = 'parcel_area'
    lot = 'Lot'
    type = 'type'
    size = 'size'

    subdiv_dict = {}
    for row in subdiv_rows:
        app_component_id = row[alr_id]

        if app_component_id in subdiv_dict:
            if row[parcel_design_id] not in subdiv_dict:
                subdiv_dict[app_component_id][size] = row[area]
                subdiv_dict[app_component_id][type] = lot

        else:
            subdiv_dict[app_component_id] = {}
            subdiv_dict[app_component_id][size] = row[area]
            subdiv_dict[app_component_id][type] = lot
            subdiv_dict[app_component_id][size] = row['road_dedication_area']
            subdiv_dict[app_component_id][type] = 'Road_Dedication'
    
    return subdiv_dict
            