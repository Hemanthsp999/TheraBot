package datahandler

import "database/sql"

type User struct{
	UserId string `json: "user_id"`
	UserName string `json: "user_name"`
	UserEmail string `json: "user_email"`
	UserPass string `json: "user_pass"`
	UserPhone string `json: "phone_number"`
	UserGender string `json: "gender"`
	IsDoctor bool `json: "is_doctor"`
}

type ProfileSwitcher struct{
	UserProfile *User
}

type DBConnection struct{
	Db *Sql.DB
}
