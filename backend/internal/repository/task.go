package repository

import (
	"context"
	"fmt"

	"github.com/KrishT0/task-server/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TaskRepo struct {
	db *pgxpool.Pool
}

func NewTaskRepo(db *pgxpool.Pool) *TaskRepo {
	return &TaskRepo{db: db}
}

type ListTasksParams struct {
	UserID string
	Status string
	Search string
	SortBy string
	Order  string
	Page   int
	Limit  int
}

func (r *TaskRepo) Create(ctx context.Context, task *model.Task) (*model.Task, error) {
	result := &model.Task{}
	err := r.db.QueryRow(ctx,
		`INSERT INTO tasks (user_id, title, description, status, priority, due_date)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at`,
		task.UserID, task.Title, task.Description, task.Status, task.Priority, task.DueDate,
	).Scan(
		&result.ID, &result.UserID, &result.Title, &result.Description,
		&result.Status, &result.Priority, &result.DueDate,
		&result.CreatedAt, &result.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (r *TaskRepo) GetByID(ctx context.Context, id, userID string) (*model.Task, error) {
	task := &model.Task{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at
		 FROM tasks WHERE id = $1 AND user_id = $2`,
		id, userID,
	).Scan(
		&task.ID, &task.UserID, &task.Title, &task.Description,
		&task.Status, &task.Priority, &task.DueDate,
		&task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (r *TaskRepo) List(ctx context.Context, params ListTasksParams) ([]*model.Task, int, error) {
	where := "WHERE user_id = $1"
	args := []any{params.UserID}
	argIdx := 2

	if params.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, params.Status)
		argIdx++
	}

	if params.Search != "" {
		where += fmt.Sprintf(" AND title ILIKE $%d", argIdx)
		args = append(args, "%"+params.Search+"%")
		argIdx++
	}

	// count total
	var total int
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM tasks "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// sorting
	allowedSortFields := map[string]bool{"due_date": true, "priority": true, "created_at": true}
	sortBy := "created_at"
	if allowedSortFields[params.SortBy] {
		sortBy = params.SortBy
	}
	order := "DESC"
	if params.Order == "asc" {
		order = "ASC"
	}

	// pagination
	offset := (params.Page - 1) * params.Limit
	query := fmt.Sprintf(
		`SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at
		 FROM tasks %s ORDER BY %s %s LIMIT $%d OFFSET $%d`,
		where, sortBy, order, argIdx, argIdx+1,
	)
	args = append(args, params.Limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var tasks []*model.Task
	for rows.Next() {
		t := &model.Task{}
		if err := rows.Scan(
			&t.ID, &t.UserID, &t.Title, &t.Description,
			&t.Status, &t.Priority, &t.DueDate,
			&t.CreatedAt, &t.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		tasks = append(tasks, t)
	}

	return tasks, total, nil
}

func (r *TaskRepo) Update(ctx context.Context, id, userID string, updates map[string]any) (*model.Task, error) {
	setClauses := ""
	args := []any{}
	argIdx := 1

	allowedFields := map[string]bool{
		"title": true, "description": true, "status": true,
		"priority": true, "due_date": true,
	}

	for field, val := range updates {
		if !allowedFields[field] {
			continue
		}
		if setClauses != "" {
			setClauses += ", "
		}
		setClauses += fmt.Sprintf("%s = $%d", field, argIdx)
		args = append(args, val)
		argIdx++
	}

	setClauses += fmt.Sprintf(", updated_at = NOW()")
	args = append(args, id, userID)

	task := &model.Task{}
	err := r.db.QueryRow(ctx,
		fmt.Sprintf(`UPDATE tasks SET %s WHERE id = $%d AND user_id = $%d
		 RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at`,
			setClauses, argIdx, argIdx+1),
		args...,
	).Scan(
		&task.ID, &task.UserID, &task.Title, &task.Description,
		&task.Status, &task.Priority, &task.DueDate,
		&task.CreatedAt, &task.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return task, nil
}

func (r *TaskRepo) Delete(ctx context.Context, id, userID string) error {
	result, err := r.db.Exec(ctx,
		"DELETE FROM tasks WHERE id = $1 AND user_id = $2",
		id, userID,
	)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("task not found")
	}
	return nil
}
