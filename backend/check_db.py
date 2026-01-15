import sqlite3

try:
    conn = sqlite3.connect('prism.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", tables)
    
    # helper: check columns of pullrequest
    for t in tables:
        if 'pullrequest' in t[0]:
            print(f"--- Columns for {t[0]} ---")
            cursor.execute(f"PRAGMA table_info({t[0]})")
            cols = cursor.fetchall()
            for c in cols:
                print(c)

    conn.close()
except Exception as e:
    print(e)
