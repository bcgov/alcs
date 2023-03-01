def inject_conn_pool(func):
    def wrapper(conn_pool):
        with conn_pool.getconn() as conn:
            func(conn)

    return wrapper
