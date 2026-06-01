package handler

import "github.com/gin-gonic/gin"

func Router() *gin.Engine {
	r := gin.Default()
	// enable CORS so frontend can reach this API from a different origin
	r.Use(CORSMiddleWare())

	api := r.Group("api")
	{
		api.POST("/login", UserLogin)
		api.POST("/signup", RegisterUser)
	}

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
