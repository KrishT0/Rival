package service

import (
	"context"
	"errors"
	"time"

	"github.com/KrishT0/task-server/internal/model"
	"github.com/KrishT0/task-server/internal/repository"
)

type TaskService struct {
	taskRepo *repository.TaskRepo
}

func NewTaskService(taskRepo *repository.TaskRepo) *TaskService {
	return &TaskService{taskRepo: taskRepo}
}

type CreateTaskInput struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Status      string  `json:"status"`
	Priority    string  `json:"priority"`
	DueDate     *string `json:"due_date"`
}

type UpdateTaskInput struct {
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	Priority    *string `json:"priority"`
	DueDate     *string `json:"due_date"`
}

type ListTasksInput struct {
	Status string
	Search string
	SortBy string
	Order  string
	Page   int
	Limit  int
}

var validStatuses = map[string]bool{"todo": true, "in_progress": true, "done": true}
var validPriorities = map[string]bool{"low": true, "medium": true, "high": true}

func (s *TaskService) Create(ctx context.Context, userID string, input CreateTaskInput) (*model.Task, error) {
	if input.Title == "" {
		return nil, errors.New("title is required")
	}

	if len(input.Title) > 200 {
		return nil, errors.New("title must be under 200 characters")
	}

	if input.Status == "" {
		input.Status = "todo"
	} else if !validStatuses[input.Status] {
		return nil, errors.New("invalid status, must be todo, in_progress, or done")
	}

	if input.Priority == "" {
		input.Priority = "medium"
	} else if !validPriorities[input.Priority] {
		return nil, errors.New("invalid priority, must be low, medium, or high")
	}

	task := &model.Task{
		UserID:      userID,
		Title:       input.Title,
		Description: input.Description,
		Status:      input.Status,
		Priority:    input.Priority,
	}

	if input.DueDate != nil && *input.DueDate != "" {
		dueDate, err := parseDueDate(input.DueDate)
		if err != nil {
			return nil, err
		}
		task.DueDate = dueDate
	}

	return s.taskRepo.Create(ctx, task)
}

func (s *TaskService) GetByID(ctx context.Context, id, userID string) (*model.Task, error) {
	if id == "" {
		return nil, errors.New("task id is required")
	}
	return s.taskRepo.GetByID(ctx, id, userID)
}

func (s *TaskService) List(ctx context.Context, userID string, input ListTasksInput) ([]*model.Task, int, error) {
	if input.Page <= 0 {
		input.Page = 1
	}
	if input.Limit <= 0 || input.Limit > 100 {
		input.Limit = 20
	}

	params := repository.ListTasksParams{
		UserID: userID,
		Status: input.Status,
		Search: input.Search,
		SortBy: input.SortBy,
		Order:  input.Order,
		Page:   input.Page,
		Limit:  input.Limit,
	}

	return s.taskRepo.List(ctx, params)
}

func (s *TaskService) Update(ctx context.Context, id, userID string, input UpdateTaskInput) (*model.Task, error) {
	if id == "" {
		return nil, errors.New("task id is required")
	}

	updates := map[string]any{}

	if input.Title != nil {
		if *input.Title == "" {
			return nil, errors.New("title cannot be empty")
		}
		if len(*input.Title) > 200 {
			return nil, errors.New("title must be under 200 characters")
		}
		updates["title"] = *input.Title
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}
	if input.Status != nil {
		if !validStatuses[*input.Status] {
			return nil, errors.New("invalid status, must be todo, in_progress, or done")
		}
		updates["status"] = *input.Status
	}
	if input.Priority != nil {
		if !validPriorities[*input.Priority] {
			return nil, errors.New("invalid priority, must be low, medium, or high")
		}
		updates["priority"] = *input.Priority
	}
	if input.DueDate != nil {
		dueDate, err := parseDueDate(input.DueDate)
		if err != nil {
			return nil, err
		}
		updates["due_date"] = dueDate
	}

	if len(updates) == 0 {
		return nil, errors.New("no fields to update")
	}

	return s.taskRepo.Update(ctx, id, userID, updates)
}

func (s *TaskService) Delete(ctx context.Context, id, userID string) error {
	if id == "" {
		return errors.New("task id is required")
	}
	return s.taskRepo.Delete(ctx, id, userID)
}

func parseDueDate(dateStr *string) (*time.Time, error) {
	if dateStr == nil || *dateStr == "" {
		return nil, nil
	}
	t, err := time.Parse(time.RFC3339, *dateStr)
	if err != nil {
		return nil, errors.New("invalid due_date format, must be RFC3339 (e.g. 2026-07-01T00:00:00Z)")
	}
	return &t, nil
}
