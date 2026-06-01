package handler

import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
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
        token := c.GetHeader("Authorization")

        if token == "" || !strings.HasPrefix(token, "Bearer ") {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Missing or invalid token",
            })
            return
        }

        // TODO: validate JWT here and extract user info
        // c.Set("user_id", claims.UserId)

        c.Next()
    }
}
