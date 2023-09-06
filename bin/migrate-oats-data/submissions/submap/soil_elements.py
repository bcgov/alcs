def get_soil_rows(rows, cursor):
    # fetches adjacent land use data, specifically direction, description and type code
    component_ids = [dict(item)["alr_appl_component_id"] for item in rows]
    component_ids_string = ', '.join(str(item) for item in component_ids)    
    soil_rows_query = f"""SELECT * from 
                        oats.oats_soil_change_elements osc
                        WHERE osc.alr_appl_component_id in ({component_ids_string})
                        """
    cursor.execute(soil_rows_query)
    soil_rows = cursor.fetchall()
    return soil_rows

def create_soil_dict(soil_rows):
    # creates dict contailing fill and remove data
    alr_id = 'alr_appl_component_id'
    area = 'project_area'
    desc = 'material_desc'
    origin_desc = 'material_origin_desc'
    duration = 'project_duration'
    volume = 'volume'
    depth = 'depth'
    code = 'soil_change_code'

    soil_dict = {}
    for row in soil_rows:
        app_component_id = row[alr_id]
        if app_component_id in soil_dict:

            if row[code] == 'REMOVE':
                # if soil_dict[app_component_id]['RMV'] == True:
                if 'RMV' in soil_dict.get(app_component_id, {}):
                        print('ignored element_id:',row['soil_change_element_id'])
                else:
                    soil_dict[app_component_id]['remove_type'] = row[desc]
                    soil_dict[app_component_id]['remove_origin'] = row[origin_desc]
                    soil_dict[app_component_id]['max_remove_depth'] = row[depth]
                    soil_dict[app_component_id]['total_remove'] = row[volume]
                    soil_dict[app_component_id]['remove_duration'] = row[duration]
                    soil_dict[app_component_id]['remove_area'] = row[area]
                    if 'import_fill' not in soil_dict.get(app_component_id, {}):
                        soil_dict[app_component_id]['import_fill'] = False                    

                soil_dict[app_component_id]['RMV'] = True


            elif row[code] == 'ADD':
                # if soil_dict[app_component_id]['ADD'] == True:
                if 'ADD' in soil_dict.get(app_component_id, {}):
                        print('ignored element_id:',row['soil_change_element_id'])
                else:            
                    soil_dict[app_component_id]['fill_type'] = row[desc]
                    soil_dict[app_component_id]['fill_origin'] = row[origin_desc]
                    soil_dict[app_component_id]['total_fill'] = row[volume]
                    soil_dict[app_component_id]['max_fill_depth'] = row[depth]
                    soil_dict[app_component_id]['fill_duration'] = row[duration]
                    soil_dict[app_component_id]['fill_area'] = row[area]
                    soil_dict[app_component_id]['import_fill'] = True

                soil_dict[app_component_id]['ADD'] = True
            
            else:
                print('unknown soil action')
        else:
            soil_dict[app_component_id] = {}
            soil_dict[app_component_id][alr_id] = row[alr_id]
            if row[code] == 'REMOVE':
                soil_dict[app_component_id]['remove_type'] = row[desc]
                soil_dict[app_component_id]['remove_origin'] = row[origin_desc]
                soil_dict[app_component_id]['max_remove_depth'] = row[depth]
                soil_dict[app_component_id]['total_remove'] = row[volume]
                soil_dict[app_component_id]['remove_duration'] = row[duration]
                soil_dict[app_component_id]['remove_area'] = row[area]
                soil_dict[app_component_id]['RMV'] = True
                soil_dict[app_component_id]['import_fill'] = False


            elif row[code] == 'ADD':          
                soil_dict[app_component_id]['fill_type'] = row[desc]
                soil_dict[app_component_id]['fill_origin'] = row[origin_desc]
                soil_dict[app_component_id]['total_fill'] = row[volume]
                soil_dict[app_component_id]['max_fill_depth'] = row[depth]
                soil_dict[app_component_id]['fill_duration'] = row[duration]
                soil_dict[app_component_id]['fill_area'] = row[area]
                soil_dict[app_component_id]['import_fill'] = True
                soil_dict[app_component_id]['ADD'] = True
                
            else:
                print('unknown soil action')
    return soil_dict
        

def map_soil_data(data, soil_data):
     #map soil data into data
    app_component_id = 'alr_appl_component_id'
    data['fill_type'] = soil_data.get(data[app_component_id], {}).get('fill_type', None)
    data['fill_origin'] = soil_data.get(data[app_component_id], {}).get('fill_origin', None)
    data['total_fill'] = soil_data.get(data[app_component_id], {}).get('total_fill', None)
    data['max_fill_depth'] = soil_data.get(data[app_component_id], {}).get('max_fill_depth', None)
    data['fill_duration'] = soil_data.get(data[app_component_id], {}).get('fill_duration', None)
    data['fill_area'] = soil_data.get(data[app_component_id], {}).get('fill_area', None)
    data['import_fill'] = soil_data.get(data[app_component_id], {}).get('import_fill', None)
    data['fill_duration_unit'] = 'months'
    data['remove_duration_unit'] = 'months'
    data['remove_type'] = soil_data.get(data[app_component_id], {}).get('remove_type', None)
    data['remove_origin'] = soil_data.get(data[app_component_id], {}).get('remove_origin', None)
    data['total_remove'] = soil_data.get(data[app_component_id], {}).get('total_remove', None)
    data['max_remove_depth'] = soil_data.get(data[app_component_id], {}).get('max_remove_depth', None)
    data['remove_duration'] = soil_data.get(data[app_component_id], {}).get('remove_duration', None)
    data['remove_area'] = soil_data.get(data[app_component_id], {}).get('remove_area', None)     
    return data

def add_soil_field(data):
    # populates columns to be inserted 
    data['fill_type'] = None
    data['fill_origin'] = None
    data['total_fill'] = None
    data['max_fill_depth'] = None
    data['fill_duration'] = None 
    data['fill_area'] = None
    data['import_fill'] = None
    data['remove_type'] = None
    data['remove_origin'] = None
    data['total_remove'] = None
    data['max_remove_depth'] = None
    data['remove_duration'] = None
    data['remove_area'] = None
    data['fill_duration_unit'] = None
    data['remove_duration_unit'] = None    
    return data
