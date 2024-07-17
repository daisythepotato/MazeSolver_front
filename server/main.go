package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"path/filepath"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Client struct {
	conn     *websocket.Conn
	room     *Room
	clientIP string
	mu       sync.Mutex
}

type Room struct {
	id       string
	clients  []*Client
	mu       sync.Mutex
	maxSize  int
	gameData *GameData
}

type GameData struct {
	matrix map[string]bool
	maze   *CheckMaze
}

var rooms = make(map[string]*Room)
var roomMu sync.Mutex
var clients = make(map[string]*Client)
var clientsMu sync.Mutex

type Message struct {
	Type     string   `json:"type"`
	RoomID   string   `json:"roomID,omitempty"`
	RoomList []string `json:"roomList,omitempty"`
	X        float64  `json:"x,omitempty"`
	Z        float64  `json:"z,omitempty"`
	GridX    int      `json:"gridX,omitempty"`
	GridZ    int      `json:"gridZ,omitempty"`
}

func main() {
	absPath, _ := filepath.Abs("../")
	log.Printf("Serving files from: %s\n", absPath)
	fs := http.FileServer(http.Dir(absPath))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)

	go broadcastRoomList()

	log.Println("HTTP server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	clientIP := getClientIP(r)
	clientsMu.Lock()
	if existingClient, exists := clients[clientIP]; exists {
		existingClient.conn.Close()
		delete(clients, clientIP)
	}
	client := &Client{conn: ws, clientIP: clientIP}
	clients[clientIP] = client
	clientsMu.Unlock()

	log.Printf("Client connected: %v (ClientIP: %s)", ws.RemoteAddr(), clientIP)

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			if client.room != nil {
				client.room.removeClient(client)
			}
			clientsMu.Lock()
			delete(clients, clientIP)
			clientsMu.Unlock()
			break
		}
		log.Printf("Received message from %s: %+v", clientIP, msg)
		switch msg.Type {
		case "create_room":
			room := createRoom()
			client.room = room
			room.addClient(client)
			client.sendMessage(Message{Type: "room_created", RoomID: room.id})
			log.Printf("Room created: %s by client %s", room.id, clientIP)
			broadcastRoomList()
		case "join_room":
			roomID := msg.RoomID
			room, exists := rooms[roomID]
			if exists && len(room.clients) < room.maxSize {
				client.room = room
				room.addClient(client)
				client.sendMessage(Message{Type: "joined_room", RoomID: roomID})
				log.Printf("Client %s joined room: %s", clientIP, roomID)
				if len(room.clients) == room.maxSize {
					startGame(room)
				}
			} else {
				client.sendMessage(Message{Type: "error", RoomID: roomID})
				log.Printf("Client %s failed to join room: %s", clientIP, roomID)
			}
			broadcastRoomList()
		case "get_rooms":
			sendRoomList(ws)
		case "placement":
			if client.room != nil {
				client.room.broadcast(msg)
				log.Printf("Block placement broadcasted by client %s: %+v", clientIP, msg)
			}
		}
	}
}

func getClientIP(r *http.Request) string {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return ""
	}
	userIP := net.ParseIP(ip)
	if userIP == nil {
		return ""
	}
	return userIP.String()
}

func createRoom() *Room {
	roomMu.Lock()
	defer roomMu.Unlock()

	id := fmt.Sprintf("room-%d", len(rooms)+1)
	room := &Room{
		id:      id,
		clients: []*Client{},
		maxSize: 2,
	}
	rooms[id] = room
	return room
}

func (r *Room) addClient(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.clients = append(r.clients, client)
	log.Printf("Client %s added to room %s", client.clientIP, r.id)
}

func (r *Room) removeClient(client *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, c := range r.clients {
		if c == client {
			r.clients = append(r.clients[:i], r.clients[i+1:]...)
			break
		}
	}
	if len(r.clients) == 0 {
		delete(rooms, r.id)
	}
	log.Printf("Client %s removed from room %s", client.clientIP, r.id)
	broadcastRoomList()
}

func (r *Room) broadcast(msg Message) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, client := range r.clients {
		client.sendMessage(msg)
	}
}

func (c *Client) sendMessage(msg Message) {
	c.mu.Lock()
	defer c.mu.Unlock()
	err := c.conn.WriteJSON(msg)
	if err != nil {
		log.Printf("error: %v", err)
		c.conn.Close()
		if c.room != nil {
			c.room.removeClient(c)
		}
	}
}

func broadcastRoomList() {
	roomMu.Lock()
	defer roomMu.Unlock()

	roomList := []string{}
	for id := range rooms {
		roomList = append(roomList, id)
	}

	for _, room := range rooms {
		for _, client := range room.clients {
			client.sendMessage(Message{Type: "room_list", RoomList: roomList})
		}
	}
	log.Printf("Room list broadcasted: %v", roomList)
}

func sendRoomList(ws *websocket.Conn) {
	roomMu.Lock()
	defer roomMu.Unlock()

	roomList := []string{}
	for id := range rooms {
		roomList = append(roomList, id)
	}

	ws.WriteJSON(Message{Type: "room_list", RoomList: roomList})
	log.Printf("Room list sent to client: %v", roomList)
}

func startGame(room *Room) {
	room.gameData = &GameData{
		matrix: make(map[string]bool),
		maze:   NewCheckMaze(51),
	}

	go func() {
		time.Sleep(5 * time.Second)
		room.broadcast(Message{Type: "start_game"})
		log.Printf("Game started in room: %s", room.id)
	}()
}
