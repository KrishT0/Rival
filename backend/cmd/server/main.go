package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/KrishT0/task-server/internal/database"
	"github.com/KrishT0/task-server/internal/handler"
	"github.com/KrishT0/task-server/internal/middleware"
	"github.com/KrishT0/task-server/internal/repository"
	"github.com/KrishT0/task-server/internal/service"
)

func main() {
	godotenv.Load()

	db := database.Connect()
	defer db.Close()

	userRepo := repository.NewUserRepo(db)
	taskRepo := repository.NewTaskRepo(db)
	authService := service.NewAuthService(userRepo)
	taskService := service.NewTaskService(taskRepo)
	authHandler := handler.NewAuthHandler(authService)
	taskHandler := handler.NewTaskHandler(taskService)

	r := chi.NewRouter()

	// global middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Heartbeat("/"))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: strings.Split(os.Getenv("ALLOWED_ORIGINS"), ","),
		AllowedMethods: []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
		MaxAge:         300,
	}))

	// public routes
	r.Post("/auth/signup", authHandler.Signup)
	r.Post("/auth/login", authHandler.Login)

	// protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth)

		r.Post("/tasks", taskHandler.Create)
		r.Get("/tasks", taskHandler.List)
		r.Get("/tasks/{id}", taskHandler.GetByID)
		r.Patch("/tasks/{id}", taskHandler.Update)
		r.Delete("/tasks/{id}", taskHandler.Delete)
	})
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("server running on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
