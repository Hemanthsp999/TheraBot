package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
	datahandler "go_server/server_handler/DataModel"
	"golang.org/x/crypto/bcrypt"
)

func InitDB() *sql.DB {
	// Using a file-based DB or :memory: for testing
	db, err := sql.Open("sqlite3", "healthcare.db")
	if err != nil {
		log.Fatal(err)
	}

	// 1. Enable Foreign Key constraints in SQLite
	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		log.Fatal("Failed to enable foreign keys:", err)
	}

	// 2. Create the Schema
	schema := `
	-- Core Authentication Table
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		age INT NOT NULL,
		phone TEXT,
		gender TEXT,
		role TEXT CHECK(role IN ('doctor', 'patient', 'admin')) NOT NULL
	);

	-- Doctor specific details
	CREATE TABLE IF NOT EXISTS doctors (
		user_id INTEGER PRIMARY KEY,
		specialization TEXT,
		license_number TEXT UNIQUE,
		bio TEXT,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	-- Patient specific details
	CREATE TABLE IF NOT EXISTS patients (
		user_id INTEGER PRIMARY KEY,
		date_of_birth DATE,
		blood_group TEXT,
		emergency_contact TEXT,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	-- Appointments
	CREATE TABLE IF NOT EXISTS appointments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		doctor_id INTEGER,
		patient_id INTEGER,
		scheduled_at DATETIME,
		status TEXT DEFAULT 'pending',
		FOREIGN KEY (doctor_id) REFERENCES doctors(user_id),
		FOREIGN KEY (patient_id) REFERENCES patients(user_id)
	);

	-- Communication (Messaging/Calls)
	CREATE TABLE IF NOT EXISTS conversations (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS messages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		conversation_id INTEGER,
		sender_id INTEGER,
		content TEXT,
		is_read BOOLEAN DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (conversation_id) REFERENCES conversations(id),
		FOREIGN KEY (sender_id) REFERENCES users(id)
	);

	-- Medical History (Access restricted to assigned doctors)
	CREATE TABLE IF NOT EXISTS medical_records (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		patient_id INTEGER,
		doctor_id INTEGER,
		diagnosis TEXT,
		treatment_plan TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (patient_id) REFERENCES patients(user_id),
		FOREIGN KEY (doctor_id) REFERENCES doctors(user_id)
	);
	`

	_, err = db.Exec(schema)
	if err != nil {
		log.Fatal("Failed to create tables:", err)
	}

	fmt.Println("Full healthcare database initialized successfully.")
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
	tx, err := db.Begin() // start transaction
	if err != nil{
		return err
	}

	// insert to users table and then map to patient or doctors table based on roles
	result, err := tx.Exec("INSERT INTO users (name, email, phone, password_hash, age, gender, role) VALUES (?, ?, ?, ?, ?, ?, ?)", 
	user_model.UserName, user_model.UserEmail, user_model.UserPhone, user_model.UserPass, user_model.UserAge, user_model.UserGender, user_model.UserRole)

	if err != nil{
		tx.Rollback()
		return err
	}

	getUserId, _ := result.LastInsertId()

	if user_model.UserRole == "doctor" {
		_, err = tx.Exec("INSERT INTO doctors (user_id) VALUES (?)", getUserId)
	}else if user_model.UserRole == "patient"{
		_, err = tx.Exec("INSERT INTO patients (user_id) VALUES (?)", getUserId)
	}

	if err != nil{
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func IsValidUser(user_model datahandler.User, db *sql.DB) (datahandler.User, bool) {
	var dbUser datahandler.User
	var storedHash string

	query := "SELECT id, email, password_hash, role FROM users WHERE email = ?"
	err := db.QueryRow(
		query,user_model.UserEmail,
	).Scan(&dbUser.UserId, &dbUser.UserEmail, &storedHash, &dbUser.UserRole)

	if err != nil {
		return dbUser, false 
	}


	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user_model.UserPass)) 

	return dbUser, err == nil
}
