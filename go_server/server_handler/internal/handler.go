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
			UserEmail: c.PostForm("user_email"),
			UserPass:  c.PostForm("user_pass"),
		}
	}

	fmt.Printf("Login attempt for email: %s\n", userModel.UserEmail)

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
			UserName:   c.PostForm("user_name"),
			UserEmail:  c.PostForm("user_email"),
			UserPass:   c.PostForm("user_pass"),
			UserPhone:  c.PostForm("user_phone"),
			UserGender: c.PostForm("user_gender"),
			UserRole:   c.PostForm("user_role"),
		}
	}

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
		UserGender: input.UserGender,
		UserRole:   input.UserRole,
	}

	if err := database.AddUser(userModel, Db.Db); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}


