package main

import (
	server "go_server/server_handler"
	datahandler "go_server/server_handler/DataModel"
)

func main() {
	s := server.ServerContainer{
		Conn: &datahandler.DBConnection{},
	}
	s.InitServer(8080)

}
