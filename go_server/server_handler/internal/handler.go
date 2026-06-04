package handler

import (
	"fmt"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	datahandler "go_server/server_handler/DataModel"
	database "go_server/server_handler/DbHandler"
	"github.com/golang-jwt/jwt/v5"
)

var Db datahandler.DBConnection

var jwtKey = []byte("secret-key-for-backend")

func UserLogin(c *gin.Context) {
	var user_model datahandler.User
	if err := c.ShouldBindJSON(&user_model); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	validUser, ok := database.IsValidUser(user_model, Db.Db)
	if !ok{
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &datahandler.Claims{
		UserID: validUser.UserId,
		Email:  validUser.UserEmail,
		Role:   validUser.UserRole,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	fmt.Println(token)
	fmt.Println(tokenString)

	c.JSON(http.StatusOK, gin.H{
		"message":      "Login successful",
		"access_token": tokenString,             // For localStorage.setItem("accessToken", ...)
		"user_type":    validUser.UserRole,       // For localStorage.setItem("user_type", ...)
		"role":         validUser.UserRole,       // For console.log("role", ...)
		"id":           validUser.UserId,         // For localStorage.setItem("user_id", ...)
		"name":         validUser.UserName,       // For localStorage.setItem("name", ...)
		"refresh":      "",                       // Placeholder for refreshToken
		"expires_at":   expirationTime.Unix(),    // Send expiration timestamp
	})
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


	fmt.Println(string(hashedPassword))
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


