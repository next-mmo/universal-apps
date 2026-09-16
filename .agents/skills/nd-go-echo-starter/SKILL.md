---
name: nd-go-echo-starter
description: Scaffold and structure Go backend services using Echo v5 and modular feature architecture inspired by nd-api. Use when creating a new Go backend service, adding modular API feature slices, or setting up Go REST APIs with Echo v5, slog, graceful shutdown, and containerization.
---

# ND Go Echo v5 Starter (`nd-go-echo-starter`)

Use this skill when scaffolding a production-ready Go REST API or microservice backend powered by **Echo v5**, structured after `nd-api` (modular feature-first architecture).

## Core Architecture

Following the `nd-api` modular pattern:

```text
cmd/
  api/
    main.go              # Composition root & module registration
internal/
  app/
    app.go               # App lifecycle manager, router booting, graceful shutdown
    module.go            # Module interface & ModuleContext definitions
  config/
    config.go            # Environment config loader
  httpapi/
    router.go            # Echo v5 setup, middleware (slog, recover, cors, secure), error handler, /healthz
  <feature>/             # Self-contained feature slices (e.g. auth, feed, items)
    module.go            # Implements app.Module (attaches public & protected routes)
Dockerfile               # Multi-stage Alpine container build
go.mod                   # Go 1.26+ & Echo v5 dependency
README.md                # Quickstart & commands
```

## Scaffolding a New Go Backend Project

When the user requests to create or initialize a Go backend service:

### 1. `go.mod`
```go
module <app-name>

go 1.26.0

require (
	github.com/labstack/echo/v5 v5.3.1
)
```

### 2. `internal/app/module.go`
```go
package app

import (
	"context"
	"log/slog"

	"<app-name>/internal/config"

	"github.com/labstack/echo/v5"
)

// ModuleContext encapsulates shared runtime resources and routers passed to feature modules upon registration.
type ModuleContext struct {
	Echo        *echo.Echo
	ApiV1       *echo.Group // Public /api/v1 router group
	ProtectedV1 *echo.Group // Protected /api/v1 router group (with auth middleware)
	Config      *config.Config
	Logger      *slog.Logger
	Context     context.Context
}

// Module represents a self-contained feature slice.
type Module interface {
	// Name returns a human-readable identifier for the module (e.g., "auth", "items").
	Name() string
	// Register attaches routes, initializes workers, and wires dependencies.
	Register(ctx *ModuleContext) error
}

// ShutdownModule is an optional interface modules can implement for clean teardown.
type ShutdownModule interface {
	Shutdown(ctx context.Context) error
}
```

### 3. `internal/config/config.go`
```go
package config

import "os"

type Config struct {
	Env     string
	Address string
}

func Load() (Config, error) {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	addr := os.Getenv("PORT")
	if addr == "" {
		addr = ":8080"
	} else if addr[0] != ':' {
		addr = ":" + addr
	}

	return Config{
		Env:     env,
		Address: addr,
	}, nil
}
```

### 4. `internal/httpapi/router.go`
```go
package httpapi

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

type errorResponse struct {
	Error string `json:"error"`
}

func New(logger *slog.Logger) *echo.Echo {
	e := echo.New()
	e.Logger = logger
	e.HTTPErrorHandler = errorHandler

	e.Use(middleware.RequestID())
	e.Use(middleware.RequestLogger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders: []string{"*"},
	}))
	e.Use(middleware.Secure())
	e.Use(middleware.BodyLimit(1 << 20)) // 1 MiB limit

	// Health check endpoint
	e.GET("/healthz", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	return e
}

func errorHandler(c *echo.Context, err error) {
	if resp, _ := echo.UnwrapResponse(c.Response()); resp != nil && resp.Committed {
		return
	}

	status := http.StatusInternalServerError
	message := "internal server error"

	var statusCoder echo.HTTPStatusCoder
	if errors.As(err, &statusCoder) {
		status = statusCoder.StatusCode()
		message = http.StatusText(status)
	}

	var httpErr *echo.HTTPError
	if errors.As(err, &httpErr) {
		status = httpErr.Code
		if httpErr.Message != "" {
			message = httpErr.Message
		}
	}

	if status >= http.StatusInternalServerError {
		c.Logger().Error("request failed", "error", err)
	}

	if writeErr := c.JSON(status, errorResponse{Error: message}); writeErr != nil {
		c.Logger().Error("write error response", "error", writeErr)
	}
}
```

### 5. `internal/app/app.go`
```go
package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"<app-name>/internal/config"
	"<app-name>/internal/httpapi"

	"github.com/labstack/echo/v5"
)

type App struct {
	Config  *config.Config
	Logger  *slog.Logger
	Echo    *echo.Echo
	modules []Module
}

func New() (*App, error) {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		return nil, fmt.Errorf("load config: %w", err)
	}

	return &App{
		Config: &cfg,
		Logger: logger,
	}, nil
}

func (a *App) Register(modules ...Module) {
	a.modules = append(a.modules, modules...)
}

func (a *App) Run() error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	a.Echo = httpapi.New(a.Logger)

	// Readiness probe
	a.Echo.GET("/readyz", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ready"})
	})

	apiV1 := a.Echo.Group("/api/v1")

	modCtx := &ModuleContext{
		Echo:    a.Echo,
		ApiV1:   apiV1,
		Config:  a.Config,
		Logger:  a.Logger,
		Context: ctx,
	}

	for _, mod := range a.modules {
		a.Logger.Info("registering module", "module", mod.Name())
		if err := mod.Register(modCtx); err != nil {
			return fmt.Errorf("register module %s: %w", mod.Name(), err)
		}
	}

	a.Logger.Info("starting server", "address", a.Config.Address, "modules", len(a.modules))

	server := echo.StartConfig{
		Address:         a.Config.Address,
		GracefulTimeout: 10 * time.Second,
	}

	if err := server.Start(ctx, a.Echo); err != nil && !errors.Is(err, context.Canceled) {
		return fmt.Errorf("server error: %w", err)
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	for _, mod := range a.modules {
		if sm, ok := mod.(ShutdownModule); ok {
			if err := sm.Shutdown(shutdownCtx); err != nil {
				a.Logger.Warn("module shutdown error", "module", mod.Name(), "error", err)
			}
		}
	}

	return nil
}
```

### 6. `cmd/api/main.go`
```go
package main

import (
	"log/slog"
	"os"

	"<app-name>/internal/app"
	"<app-name>/internal/example"
)

func main() {
	application, err := app.New()
	if err != nil {
		slog.Error("failed to initialize application", "error", err)
		os.Exit(1)
	}

	// Register pluggable feature modules
	application.Register(
		example.NewModule(),
	)

	if err := application.Run(); err != nil {
		slog.Error("application exited with error", "error", err)
		os.Exit(1)
	}
}
```

### 7. Adding a Feature Slice (`internal/<feature>/module.go`)
```go
package example

import (
	"net/http"

	"<app-name>/internal/app"

	"github.com/labstack/echo/v5"
)

type Module struct{}

func NewModule() *Module {
	return &Module{}
}

func (m *Module) Name() string {
	return "example"
}

func (m *Module) Register(ctx *app.ModuleContext) error {
	ctx.ApiV1.GET("/hello", func(c *echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Hello from Echo v5 API",
		})
	})
	return nil
}
```

## Running & Testing

```bash
# 1. Download dependencies
go mod tidy

# 2. Run unit tests
go test ./...

# 3. Start local development server
go run ./cmd/api

# 4. Check probes
curl http://localhost:8080/healthz
curl http://localhost:8080/readyz
curl http://localhost:8080/api/v1/hello
```

---

## Skill Scripts & CLI Integration

This skill contains self-contained starter templates and a scaffolding runner:

1. **Canonical Template**:
   `.agents/skills/nd-go-echo-starter/templates/starter.mjs`
   Exposes `getGoEchoTemplateFiles(name, options)` returning all starter files.

2. **Skill Scaffolding Script**:
   `.agents/skills/nd-go-echo-starter/scripts/scaffold.mjs`
   Can be run directly by agents:
   ```bash
   node .agents/skills/nd-go-echo-starter/scripts/scaffold.mjs <project-name>
   ```

3. **Universal CLI Link**:
   The Universal CLI (`universal create <name> --framework go-echo`) links directly to this skill's `starter.mjs` template, ensuring zero duplication between CLI generators and agent skills.
