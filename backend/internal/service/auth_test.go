package service

import (
	"context"
	"testing"
)

func TestSignup_InvalidEmail(t *testing.T) {
	s := NewAuthService(nil)

	_, err := s.Signup(context.Background(), "not-an-email", "password123")

	if err == nil {
		t.Fatal("expected error for invalid email, got nil")
	}

	expected := "invalid email format"
	if err.Error() != expected {
		t.Errorf("expected error %q, got %q", expected, err.Error())
	}
}
