package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

var users = make(map[int]User)

func createUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var u User
	err := json.NewDecoder(r.Body).Decode(&u)
	if err != nil {
		http.Error(w, "bad request", 400)
		return
	}
	users[u.ID] = u
	json.NewEncoder(w).Encode(u)
}
func getUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Query().Get("id")
	if idStr != "" {
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "bad request", 400)
			return
		}
		u, exists := users[id]
		if !exists {
			http.Error(w, "not found", 404)
			return
		}
		json.NewEncoder(w).Encode(u)
		return
	}
	json.NewEncoder(w).Encode(users)
}
func deleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "bad request", 400)
		return
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "bad request", 400)
		return
	}
	_, exists := users[id]
	if !exists {
		http.Error(w, "not found", 404)
		return
	}
	delete(users, id)
	json.NewEncoder(w).Encode("deleted")
}
func updateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "bad request", 400)
		return
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "bad request", 400)
		return
	}
	u, exists := users[id]
	if !exists {
		http.Error(w, "not found", 404)
		return
	}
	var newData User
	err = json.NewDecoder(r.Body).Decode(&newData)
	if err != nil {
		http.Error(w, "bad request", 400)
		return
	}
	u.Name = newData.Name
	users[id] = u
	json.NewEncoder(w).Encode(u)
}

func UsersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		createUser(w, r)
	case "GET":
		getUser(w,r)
	case "PUT":
		updateUser(w, r)
	case "DELETE":
		deleteUser(w, r)
	default:
		http.Error(w, "method not allowed", 405)
	}
}

// func main() {
// 	http.HandleFunc("/users", UsersHandler)

// 	fmt.Println("Server running at http://localhost:8080")
// 	http.ListenAndServe(":8080", nil)
// }
