package handler

import (
	"encoding/json"
	"net/http"

	"github.com/KrishT0/task-server/internal/service"
	"github.com/KrishT0/task-server/internal/util"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type authRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		util.WriteError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	if len(req.Password) < 6 {
		util.WriteError(w, http.StatusBadRequest, "password must be at least 6 characters")
		return
	}

	user, err := h.authService.Signup(r.Context(), req.Email, req.Password)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "could not generate token")
		return
	}

	util.WriteJSON(w, http.StatusCreated, map[string]any{
		"message": "signup successful",
		"token":   token,
		"user":    user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req authRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.Password == "" {
		util.WriteError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	token, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		util.WriteError(w, http.StatusUnauthorized, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]any{
		"token": token,
	})
}
