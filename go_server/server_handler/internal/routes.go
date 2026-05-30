package server_handler

import (
	"net/http",
	"github.com/gin-gonic/gin"
	"go_server/server_handler/internal/handler"
)

func Router() *gin.Engine(){

	r := gin.Default()

	r.POST("/login", handler.UserLogin)
	r.POST("/sigup", handler.RegisterUser)

	return r
}

