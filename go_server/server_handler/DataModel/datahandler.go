package datahandler

import "database/sql"

type User struct {
	UserId     string `json:"user_id"`
	UserName   string `json:"name"`     // Match React "name"
	UserEmail  string `json:"email"`    // Match React "email"
	UserPass   string `json:"password"` // Match React "password"
	UserPhone  string `json:"phone_number"`
	UserAge    string `json:"age"`
	UserGender string `json:"gender"`
	UserRole   string `json:"role"`
}


type ProfileSwitcher struct {
	UserProfile *User
}

type DBConnection struct {
	Db *sql.DB
}
