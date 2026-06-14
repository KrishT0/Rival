.PHONY: dev up down install-hooks backend frontend

dev: up
	@echo "starting backend and frontend..."
	@( cd backend && go run cmd/server/main.go ) & \
	( cd frontend && pnpm dev ) & \
	wait

up:
	docker compose up -d
	@echo "waiting for postgres..."
	@sleep 3

down:
	docker compose down

backend:
	cd backend && go run cmd/server/main.go

frontend:
	cd frontend && pnpm dev

install-hooks:
	cp scripts/pre-commit .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "Git hooks installed."