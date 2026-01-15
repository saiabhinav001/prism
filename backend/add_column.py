import sqlite3

# Connect to the database
conn = sqlite3.connect('prism.db')
cursor = conn.cursor()

try:
    # Add the missing column
    cursor.execute("ALTER TABLE pullrequest ADD COLUMN author_avatar_url VARCHAR")
    print("Successfully added author_avatar_url column to pullrequest table.")
    conn.commit()
except sqlite3.OperationalError as e:
    print(f"Column might already exist or other error: {e}")

conn.close()
