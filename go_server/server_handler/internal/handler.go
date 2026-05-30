pacakge server_handler

import (
	"net/http",
	"github.com/gin-gonic/gin",
	db "go_server/server_handler/DbHandler/database",
	dataContent "go_server/server_handler/DataModel/datahandler"
)

var Db dataContent.DBConnection

func UserLogin(c *gin.Context){

	userEamil, userPass := c.PostForm("user_email"), c.PostForm("user_pass")

	fmt.Printf("User %s and pass %s\n", userName, userPass)

	var UserModel UserHandler.User 

	UserModel.UserEmail = userEmail
	UserModel.UserPass = userPass

	is_valid := db.IsValidUser(UserModel, Db)

	if !is_valid{
		log.Print("User not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid email or password"})
		return
	}

	fmt.Printf("user found")

	c.JSON(http.StatusFound, gin.H{"message": "user creds found!"})
}

func RegisterUser(c *gin.Context) {
	// 1. Retrieve form values
	user_name := c.PostForm("user_name")
	user_email := c.PostForm("user_email")
	user_pass := c.PostForm("user_pass")
	user_phone := c.PostForm("user_phone")
	user_gender := c.PostForm("user_gender")
	user_role := c.PostForm("user_role")

	// 2. Hash the password
	// bcrypt.DefaultCost is usually 10. Higher is more secure but slower.
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user_pass), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// 3. Initialize the struct correctly
	// Use := for new variables inside the function, and fix the syntax (commas and colons)
	user_model := &UserHandler{
		UserName:  user_name,
		UserEmail: user_email,
		Password:  string(hashedPassword), // Store the hash, never plain text
		Phone:     user_phone,
		Gender:    user_gender,
		Role:      user_role,
	}

	// 4. Save to Database
	// Assuming 'db' is your GORM instance passed to the function
	result := db.AddUser(user_model, Db)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user", "details": result.Error.Error()})
		return
	}

	// 5. Success Response
	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user_id": user_model.ID, // Assumes your struct has an ID field populated by DB
	})
}


