package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
	"go_server/server_handler/DataModel"
	"golang.org/x/crypto/bcrypt"
)

func InitDB() *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		log.Fatal(err)
	}
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE,
		password_hash TEXT,
		name TEXT,
		phone TEXT,
		gender TEXT,
		role TEXT
	)`)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Database initialized in memory.")
	return db
}

func CloseDB(db *sql.DB) {
	if db != nil {
		db.Close()
		fmt.Println("Database connection closed.")
	}
}

// AddUser stores user with an already-hashed password
func AddUser(user_model datahandler.User, db *sql.DB) error {
	query := `INSERT INTO users (name, email, password_hash, phone, gender, role) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := db.Exec(query,
		user_model.UserName,
		user_model.UserEmail,
		user_model.UserPass,
		user_model.UserPhone,
		user_model.UserGender,
		user_model.UserRole,
	)
	return err
}

func IsValidUser(user_model datahandler.User, db *sql.DB) bool {
	var storedHash string
	err := db.QueryRow(
		"SELECT password_hash FROM users WHERE email = ?",
		user_model.UserEmail,
	).Scan(&storedHash)
	if err != nil {
		return false
	}
	return bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user_model.UserPass)) == nil
}
