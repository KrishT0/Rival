package middleware

import (
	"context"
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/KrishT0/task-server/internal/util"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userID"
const UserRoleKey contextKey = "userRole"

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			util.WriteError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			util.WriteError(w, http.StatusUnauthorized, "invalid authorization format")
			return
		}

		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				util.WriteError(w, http.StatusUnauthorized, "token expired")
				return
			}
			if errors.Is(err, jwt.ErrTokenMalformed) {
				util.WriteError(w, http.StatusUnauthorized, "malformed token")
				return
			}
			util.WriteError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		if !token.Valid {
			util.WriteError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			util.WriteError(w, http.StatusUnauthorized, "invalid token claims")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, claims["sub"].(string))
		ctx = context.WithValue(ctx, UserRoleKey, claims["role"].(string))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserIDFromCtx(ctx context.Context) string {
	id, _ := ctx.Value(UserIDKey).(string)
	return id
}

func UserRoleFromCtx(ctx context.Context) string {
	role, _ := ctx.Value(UserRoleKey).(string)
	return role
}
