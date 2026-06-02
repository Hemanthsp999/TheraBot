package datahandler

import (
	"database/sql"
	"time"
	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	UserId     string `json:"user_id"`
	UserName   string `json:"name"`     // Match React "name"
	UserEmail  string `json:"email"`    // Match React "email"
	UserPass   string `json:"password"` // Match React "password"
	UserPhone  string `json:"phone_number"`
	UserAge    string `json:"age"`
	UserGender string `json:"gender"`
	UserRole   string `json:"role"`
	Token 	   *string `json:"token"`
	Refresh_token *string            `json:"refresh_token"`
	Created_at    time.Time          `json:"created_at"`
	Updated_at    time.Time          `json:"updated_at"`
}


type ProfileSwitcher struct {
	UserProfile *User
}

type DBConnection struct {
	Db *sql.DB
}

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}
