package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"go_server/server_handler/DataModel"
	"go_server/server_handler/DbHandler"
)

var Db datahandler.DBConnection

func UserLogin(c *gin.Context) {
	userEmail := c.PostForm("user_email")
	userPass := c.PostForm("user_pass")

	fmt.Printf("Login attempt for email: %s\n", userEmail)

	userModel := datahandler.User{
		UserEmail: userEmail,
		UserPass:  userPass,
	}

	if !database.IsValidUser(userModel, Db.Db) {
		log.Print("Invalid credentials")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func RegisterUser(c *gin.Context) {
	userPass := c.PostForm("user_pass")

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userPass), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	userModel := datahandler.User{
		UserName:   c.PostForm("user_name"),
		UserEmail:  c.PostForm("user_email"),
		UserPass:   string(hashedPassword),
		UserPhone:  c.PostForm("user_phone"),
		UserGender: c.PostForm("user_gender"),
		UserRole:   c.PostForm("user_role"),
	}

	if err := database.AddUser(userModel, Db.Db); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}


