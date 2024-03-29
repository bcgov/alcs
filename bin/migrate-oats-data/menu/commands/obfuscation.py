from prod_db_obfuscation import process_oats_data
from prod_db_obfuscation import process_alcs_data


def start_obfuscation(console):
    console.log("Beginning PROD data obfuscation")
    with console.status("PROD data obfuscation\n") as status:
        process_oats_data()
        process_alcs_data()
