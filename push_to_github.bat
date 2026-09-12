@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo   yt-veloce - Synchronize & Push to GitHub Repository
echo   Target: https://github.com/vaelorix/yt-veloce.git (main)
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Verifying git branch status...
git branch --show-current
git status -s
echo.

echo [2/3] Setting remote 'origin' to https://github.com/vaelorix/yt-veloce.git ...
git remote set-url origin https://github.com/vaelorix/yt-veloce.git 2>nul
if %ERRORLEVEL% NEQ 0 (
    git remote add origin https://github.com/vaelorix/yt-veloce.git
)

echo.
echo [3/3] Pushing commits from veloce-main to main branch...
echo If prompted by GitHub / Git Credential Manager, select "Sign in with your browser"
echo to authorize vaelorix.
echo.

git push -u origin veloce-main:main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   SUCCESS! All commits pushed to https://github.com/vaelorix/yt-veloce
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo   Push encountered an error. If Git Credential Manager was
    echo   logged into a different account, you can push with a token:
    echo   git push https://<YOUR_GITHUB_TOKEN>@github.com/vaelorix/yt-veloce.git veloce-main:main
    echo ============================================================
)

echo.
pause
