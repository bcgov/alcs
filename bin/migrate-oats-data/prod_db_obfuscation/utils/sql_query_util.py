from ..lorem_ipsum import lorem_ipsum_string

lorem_ipsum_function_query = f"""
CREATE OR REPLACE FUNCTION random_lorem_ipsum() RETURNS text AS $$
    DECLARE
        lorem_ipsum_str text = '{lorem_ipsum_string}';-- put your full string here

        words text[];
        i INT;
        output text = '';
        
    BEGIN

        words := string_to_array(lorem_ipsum_str, ' ');

        FOR i IN 1..50 LOOP
            output := output || ' ' || words[1 + floor(random() * array_length(words, 1))];
        END LOOP;

        RETURN output;
        
END;
$$ LANGUAGE plpgsql;"""


def get_update_column_query(column_name):
    return f"{column_name} = CASE WHEN {column_name} IS NOT NULL THEN %s ELSE NULL END"
