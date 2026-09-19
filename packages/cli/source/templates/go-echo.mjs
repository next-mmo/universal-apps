export function getGoEchoTemplateFiles(name, _options = {}) {
  const moduleName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const files = new Map();

  files.set('.gitignore', `# Binaries
bin/
dist/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test & coverage
*.out
*.test
coverage.txt

# Environment & local secrets
.env
.env.local

# IDE
.idea/
.vscode/
*.swp
`);

  files.set('go.mod', `module ${moduleName}

go 1.26.0

require (
\tgithub.com/labstack/echo/v5 v5.3.1
)
`);

  files.set('cmd/api/main.go', `package main

import (
\t"log/slog"
\t"os"

\t"${moduleName}/internal/app"
\t"${moduleName}/internal/example"
)

func main() {
\tapplication, err := app.New()
\tif err != nil {
\t\tslog.Error("failed to initialize application", "error", err)
\t\tos.Exit(1)
\t}

\t// Register feature modules
\tapplication.Register(
\t\texample.NewModule(),
\t)

\tif err := application.Run(); err != nil {
\t\tslog.Error("application exited with error", "error", err)
\t\tos.Exit(1)
\t}
}
`);

  files.set('internal/app/module.go', `package app

import (
\t"context"
\t"log/slog"

\t"${moduleName}/internal/config"

\t"github.com/labstack/echo/v5"
)

// ModuleContext encapsulates shared runtime resources and routers passed to feature modules upon registration.
type ModuleContext struct {
\tEcho        *echo.Echo
\tApiV1       *echo.Group // Public /api/v1 router group
\tConfig      *config.Config
\tLogger      *slog.Logger
\tContext     context.Context
}

// Module represents a self-contained feature slice.
type Module interface {
\t// Name returns a human-readable identifier for the module.
\tName() string
\t// Register attaches routes, initializes workers, and wires dependencies into the application.
\tRegister(ctx *ModuleContext) error
}

// ShutdownModule is an optional interface modules can implement to perform clean teardown.
type ShutdownModule interface {
\tShutdown(ctx context.Context) error
}
`);

  files.set('internal/config/config.go', `package config

import (
\t"os"
)

type Config struct {
\tEnv     string
\tAddress string
}

func Load() (Config, error) {
\tenv := os.Getenv("APP_ENV")
\tif env == "" {
\t\tenv = "development"
\t}

\taddr := os.Getenv("PORT")
\tif addr == "" {
\t\taddr = ":8080"
\t} else if addr[0] != ':' {
\t\taddr = ":" + addr
\t}

\treturn Config{
\t\tEnv:     env,
\t\tAddress: addr,
\t}, nil
}
`);

  files.set('internal/httpapi/router.go', `package httpapi

import (
\t"errors"
\t"log/slog"
\t"net/http"

\t"github.com/labstack/echo/v5"
\t"github.com/labstack/echo/v5/middleware"
)

type errorResponse struct {
\tError string \`json:"error"\`
}

func New(logger *slog.Logger) *echo.Echo {
\te := echo.New()
\te.Logger = logger
\te.HTTPErrorHandler = errorHandler

\te.Use(middleware.RequestID())
\te.Use(middleware.RequestLogger())
\te.Use(middleware.Recover())
\te.Use(middleware.CORSWithConfig(middleware.CORSConfig{
\t\tAllowOrigins: []string{"*"},
\t\tAllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
\t\tAllowHeaders: []string{"*"},
\t}))
\te.Use(middleware.Secure())
\te.Use(middleware.BodyLimit(1 << 20)) // 1 MiB default body limit

\te.GET("/healthz", func(c *echo.Context) error {
\t\treturn c.JSON(http.StatusOK, map[string]string{"status": "ok"})
\t})

\treturn e
}

func errorHandler(c *echo.Context, err error) {
\tif resp, _ := echo.UnwrapResponse(c.Response()); resp != nil && resp.Committed {
\t\treturn
\t}

\tstatus := http.StatusInternalServerError
\tmessage := "internal server error"

\tvar statusCoder echo.HTTPStatusCoder
\tif errors.As(err, &statusCoder) {
\t\tstatus = statusCoder.StatusCode()
\t\tmessage = http.StatusText(status)
\t}

\tvar httpErr *echo.HTTPError
\tif errors.As(err, &httpErr) {
\t\tstatus = httpErr.Code
\t\tif httpErr.Message != "" {
\t\t\tmessage = httpErr.Message
\t\t}
\t}

\tif status >= http.StatusInternalServerError {
\t\tc.Logger().Error("request failed", "error", err)
\t}

\tif writeErr := c.JSON(status, errorResponse{Error: message}); writeErr != nil {
\t\tc.Logger().Error("write error response", "error", writeErr)
\t}
}
`);

  files.set('internal/app/app.go', `package app

import (
\t"context"
\t"errors"
\t"fmt"
\t"log/slog"
\t"net/http"
\t"os"
\t"os/signal"
\t"syscall"
\t"time"

\t"${moduleName}/internal/config"
\t"${moduleName}/internal/httpapi"

\t"github.com/labstack/echo/v5"
)

type App struct {
\tConfig  *config.Config
\tLogger  *slog.Logger
\tEcho    *echo.Echo
\tmodules []Module
}

func New() (*App, error) {
\tlogger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
\tslog.SetDefault(logger)

\tcfg, err := config.Load()
\tif err != nil {
\t\treturn nil, fmt.Errorf("load config: %w", err)
\t}

\treturn &App{
\t\tConfig: &cfg,
\t\tLogger: logger,
\t}, nil
}

func (a *App) Register(modules ...Module) {
\ta.modules = append(a.modules, modules...)
}

func (a *App) Run() error {
\tctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
\tdefer stop()

\ta.Echo = httpapi.New(a.Logger)

\t// Readiness probe
\ta.Echo.GET("/readyz", func(c *echo.Context) error {
\t\treturn c.JSON(http.StatusOK, map[string]string{
\t\t\t"status": "ready",
\t\t})
\t})

\tapiV1 := a.Echo.Group("/api/v1")

\tmodCtx := &ModuleContext{
\t\tEcho:    a.Echo,
\t\tApiV1:   apiV1,
\t\tConfig:  a.Config,
\t\tLogger:  a.Logger,
\t\tContext: ctx,
\t}

\tfor _, mod := range a.modules {
\t\ta.Logger.Info("registering module", "module", mod.Name())
\t\tif err := mod.Register(modCtx); err != nil {
\t\t\treturn fmt.Errorf("register module %s: %w", mod.Name(), err)
\t\t}
\t}

\ta.Logger.Info("starting server", "address", a.Config.Address, "modules", len(a.modules))

\tserver := echo.StartConfig{
\t\tAddress:         a.Config.Address,
\t\tGracefulTimeout: 10 * time.Second,
\t}

\tif err := server.Start(ctx, a.Echo); err != nil && !errors.Is(err, context.Canceled) {
\t\treturn fmt.Errorf("server error: %w", err)
\t}

\tshutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
\tdefer shutdownCancel()

\tfor _, mod := range a.modules {
\t\tif sm, ok := mod.(ShutdownModule); ok {
\t\t\tif err := sm.Shutdown(shutdownCtx); err != nil {
\t\t\t\ta.Logger.Warn("module shutdown error", "module", mod.Name(), "error", err)
\t\t\t}
\t\t}
\t}

\treturn nil
}
`);

  files.set('internal/example/module.go', `package example

import (
\t"net/http"

\t"${moduleName}/internal/app"

\t"github.com/labstack/echo/v5"
)

type Module struct{}

func NewModule() *Module {
\treturn &Module{}
}

func (m *Module) Name() string {
\treturn "example"
}

func (m *Module) Register(ctx *app.ModuleContext) error {
\tctx.ApiV1.GET("/hello", func(c *echo.Context) error {
\t\treturn c.JSON(http.StatusOK, map[string]string{
\t\t\t"message": "Hello from Echo v5 API",
\t\t})
\t})
\treturn nil
}
`);

  files.set('Dockerfile', `# syntax=docker/dockerfile:1
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download || true

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /bin/api /usr/local/bin/api

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/api"]
`);

  files.set('README.md', `# ${name}

Modular Go backend API built with [Echo v5](https://github.com/labstack/echo/v5).

## Getting Started

1. Download dependencies:
\`\`\`bash
go mod tidy
\`\`\`

2. Run the server:
\`\`\`bash
go run ./cmd/api
\`\`\`

3. Verify:
- Health check: \`curl http://localhost:8080/healthz\`
- Example endpoint: \`curl http://localhost:8080/api/v1/hello\`

## Architecture

Modular Feature-First Architecture inspired by \`nd-api\`:
- \`cmd/api/main.go\`: Application entry point and module registration
- \`internal/app/\`: Application lifecycle, runtime context and \`Module\` contract
- \`internal/config/\`: Environment configuration loader
- \`internal/httpapi/\`: Echo v5 setup, middleware, error handlers
- \`internal/example/\`: Self-contained feature module
`);

  return files;
}
