import mysql.connector
import pwinput

class connect_to_database:
    def __init__(self):
        try:
            self.connection=mysql.connector.connect(
            host=input("enter host name: "),
            port=int(input("enter port: ")),
            user=input("enter username: "),
            password= pwinput.pwinput(prompt='Enter password: '),
            database=input("enter database name: "),
            #ssl_ca="ca.pem",          
        )

            if self.connection.is_connected():
                print("Connected successfully")
                self.connected = 1
            else:
                self.connected = 0

        except mysql.connector.Error as err:
            print("Error:", err)
            self.connected = 0

