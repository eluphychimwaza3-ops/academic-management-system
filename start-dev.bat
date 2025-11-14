@echo off
REM Install dependencies
echo Installing dependencies...
pnpm install
echo.
echo Dependencies installed successfully!
echo.
echo Starting Next.js dev server on port 3000...
echo.
pnpm run dev
