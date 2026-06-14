package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/KrishT0/task-server/internal/middleware"
	"github.com/KrishT0/task-server/internal/service"
	"github.com/KrishT0/task-server/internal/util"
	"github.com/go-chi/chi/v5"
)

type TaskHandler struct {
	taskService *service.TaskService
}

func NewTaskHandler(taskService *service.TaskService) *TaskHandler {
	return &TaskHandler{taskService: taskService}
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())

	var input service.CreateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	task, err := h.taskService.Create(r.Context(), userID, input)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusCreated, task)
}

func (h *TaskHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	id := chi.URLParam(r, "id")

	task, err := h.taskService.GetByID(r.Context(), id, userID)
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "task not found")
		return
	}

	util.WriteJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	input := service.ListTasksInput{
		Status: r.URL.Query().Get("status"),
		Search: r.URL.Query().Get("search"),
		SortBy: r.URL.Query().Get("sort_by"),
		Order:  r.URL.Query().Get("order"),
		Page:   page,
		Limit:  limit,
	}

	tasks, total, err := h.taskService.List(r.Context(), userID, input)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "failed to fetch tasks")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]any{
		"data":  tasks,
		"total": total,
		"page":  input.Page,
		"limit": input.Limit,
	})
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	id := chi.URLParam(r, "id")

	var input service.UpdateTaskInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	task, err := h.taskService.Update(r.Context(), id, userID, input)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	util.WriteJSON(w, http.StatusOK, task)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromCtx(r.Context())
	id := chi.URLParam(r, "id")

	if err := h.taskService.Delete(r.Context(), id, userID); err != nil {
		util.WriteError(w, http.StatusNotFound, "task not found")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "task deleted"})
}
