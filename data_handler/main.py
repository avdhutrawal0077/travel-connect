import sql

db=sql.main()
sql.insert_user(db,'harsh', 'harsh@gmail.com')
a=sql.get_users(db,2)
print(a)