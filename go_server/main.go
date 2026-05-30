package main

import (
	"go_server/server_handler/datahandler"
	"go_server/server_handler/server"
)

func main() {

	s := server.ServerContainer{
		Conn: &datahandler.DBConnection{},
	}

	s.InitServer(8080)
}
