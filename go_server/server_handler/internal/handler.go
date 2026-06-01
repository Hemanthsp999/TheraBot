package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	datahandler "go_server/server_handler/DataModel"
	database "go_server/server_handler/DbHandler"
)

var Db datahandler.DBConnection

func UserLogin(c *gin.Context) {
	var userModel datahandler.User

	// Support JSON body or form-encoded
	if c.ContentType() == "application/json" {
		if err := c.BindJSON(&userModel); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
			return
		}
	} else {
		userModel = datahandler.User{
			UserEmail: c.PostForm("email"),
			UserPass:  c.PostForm("password"),
			UserRole: c.PostForm("role"),
		}
		fmt.Printf("Login attempt for email: %s with permission: %s\n", userModel.UserEmail, userModel.UserRole)
	}


	if !database.IsValidUser(userModel, Db.Db) {
		log.Print("Invalid credentials")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func RegisterUser(c *gin.Context) {
	var input datahandler.User
	if c.ContentType() == "application/json" {
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
			return
		}
	} else {
		input = datahandler.User{
			UserName:   c.PostForm("name"),
			UserEmail:  c.PostForm("email"),
			UserPass:   c.PostForm("password"),
			UserPhone:  c.PostForm("phone_number"),
			UserAge:    c.PostForm("age"),
			UserGender: c.PostForm("gender"),
			UserRole:   c.PostForm("role"),
		}
	}

	fmt.Printf("name: %s email: %s password: %s age: %s gender: %s phone: %s role: %s\n", input.UserName, input.UserEmail, input.UserPass, input.UserAge, input.UserGender, input.UserPhone, input.UserRole)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.UserPass), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	userModel := datahandler.User{
		UserName:   input.UserName,
		UserEmail:  input.UserEmail,
		UserPass:   string(hashedPassword),
		UserPhone:  input.UserPhone,
		UserAge:    input.UserAge,
		UserGender: input.UserGender,
		UserRole:   input.UserRole,
	}

	if err := database.AddUser(userModel, Db.Db); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}


