package service

import (
	"context"
	"testing"
)

func TestCreateTask_EmptyTitle(t *testing.T) {
	s := NewTaskService(nil)

	_, err := s.Create(context.Background(), "user-123", CreateTaskInput{
		Title: "",
	})

	if err == nil {
		t.Fatal("expected error for empty title, got nil")
	}

	expected := "title is required"
	if err.Error() != expected {
		t.Errorf("expected error %q, got %q", expected, err.Error())
	}
}

func TestCreateTask_InvalidStatus(t *testing.T) {
	s := NewTaskService(nil)

	_, err := s.Create(context.Background(), "user-123", CreateTaskInput{
		Title:  "Valid title",
		Status: "not_a_real_status",
	})

	if err == nil {
		t.Fatal("expected error for invalid status, got nil")
	}

	expected := "invalid status, must be todo, in_progress, or done"
	if err.Error() != expected {
		t.Errorf("expected error %q, got %q", expected, err.Error())
	}
}

func TestCreateTask_TitleTooLong(t *testing.T) {
	s := NewTaskService(nil)

	longTitle := make([]byte, 201)
	for i := range longTitle {
		longTitle[i] = 'a'
	}

	_, err := s.Create(context.Background(), "user-123", CreateTaskInput{
		Title: string(longTitle),
	})

	if err == nil {
		t.Fatal("expected error for title over 200 chars, got nil")
	}

	expected := "title must be under 200 characters"
	if err.Error() != expected {
		t.Errorf("expected error %q, got %q", expected, err.Error())
	}
}
