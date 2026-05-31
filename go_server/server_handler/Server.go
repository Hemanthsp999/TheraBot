package server_handler

import (
	"context"
	"fmt"
	"log"
	"net/http"

	datahandler "go_server/server_handler/DataModel"
	database "go_server/server_handler/DbHandler"
	"go_server/server_handler/internal"
)

type ServerContainer struct {
	Conn       *datahandler.DBConnection
	httpServer *http.Server
}

func (s *ServerContainer) InitServer(port int) {
	s.Conn.Db = database.InitDB()
	handler.Db = *s.Conn

	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Starting server on port %d\n", port)

	s.httpServer = &http.Server{
		Addr:    addr,
		Handler: handler.Router(),
	}

	if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func (s *ServerContainer) KillServer() {
	if s.httpServer != nil {
		if err := s.httpServer.Shutdown(context.Background()); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}
	database.CloseDB(s.Conn.Db)
	fmt.Println("Server stopped.")
}
