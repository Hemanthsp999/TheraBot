package server

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"strings"

	"go_server/server_handler/DataModel/datahandler"
	"go_server/server_handler/DataModel/datahandler"
)

type ServerContainer struct {
	Conn *datahandler.DBConnection
}

func (s *ServerContainer) InitServer(port int) {
	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Starting server on Port %d\n", port)

	// Initialize DB and store it in the container
	s.Conn.Db = db.InitDB()

	// Use a default serve mux or define your routes here
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Server is running")
	})

	log.Fatal(http.ListenAndServe(addr, nil))
}

func (s *ServerContainer) KillServer(port int) {
	go func() {
		portStr := fmt.Sprintf("%d", port)
		cmd := exec.Command("lsof", "-ti", "tcp:"+portStr)
		output, err := cmd.Output()

		if err != nil {
			return
		}

		pid := strings.TrimSpace(string(output))
		if pid == "" {
			return
		}

		pidInt := strings.Split(pid, "\n")[0]
		killCmd := exec.Command("kill", "-9", pidInt)

		if err := killCmd.Run(); err == nil {
			db.CloseDB(s.Conn.Db)
			fmt.Printf("Successfully killed process %s on port %d\n", pidInt, port)
		}
	}()
}
