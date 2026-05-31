package handler

import "github.com/gin-gonic/gin"

func Router() *gin.Engine {
	r := gin.Default()


	/*
	r.Use(CORSMiddleware())     // apply globally
	r.Use(RateLimitMiddleware())
	*/

	r.POST("/login", UserLogin)
	r.POST("/signup", RegisterUser)

	// Protected routes — auth middleware on a group
	/*
	protected := r.Group("/api")
	protected.Use(AuthMiddleware())
	{
		protected.GET("/profile", GetProfile)
		protected.POST("/logout", Logout)
	}
	*/

	return r
}
