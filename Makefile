.PHONY: dev up down install-hooks

dev: up
	cd backend && go run cmd/server/main.go

up:
	docker compose up -d
	@echo "waiting for postgres..."
	@sleep 3

down:
	docker compose down

install-hooks:
	cp scripts/pre-commit .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "Git hooks installed."