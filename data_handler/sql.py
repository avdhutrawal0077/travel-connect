import connect_to_db as ctd

def main():
    db=ctd.connect_to_database()

    if db.connected==1:
        print("connected to database")
    else:
        print("failed to connect to database")
    
    return db

if __name__== "__main__":
    main()

def insert_user(db, name, email):

    cursor = db.connection.cursor()

    query = "INSERT INTO users (name,email) VALUES (%s,%s)"
    values = (name,email)

    cursor.execute(query, values)
    db.connection.commit()

    cursor.close()

def get_users(db,uid):

    cursor = db.connection.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE uid = %s"

    cursor.execute(query, (uid,))

    result = cursor.fetchall()

    cursor.close()

    return result

def delete_user(db, user_id):

    cursor = db.connection.cursor()

    query = "DELETE FROM users WHERE id=%s"

    values = (user_id,)

    cursor.execute(query, values)

    db.connection.commit()

    cursor.close()