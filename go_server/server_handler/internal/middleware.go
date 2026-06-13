package handler

import (
	"log"
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	datahandler "go_server/server_handler/DataModel"
)


func CORSMiddleWare() gin.HandlerFunc {

	return func(c *gin.Context){
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}


func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")

        if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Authorization header missing",
            })
            return
        }

	log.Printf("Debug::Auth: %s", authHeader)

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	claims := &datahandler.Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token)(interface{}, error){
		return jwtKey, nil
	})

	if err != nil || !token.Valid{
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or Expired token"})
		return 
	}

	c.Set("userId", claims.UserID)
	c.Set("role", claims.Role)

        c.Next()
    }
}
