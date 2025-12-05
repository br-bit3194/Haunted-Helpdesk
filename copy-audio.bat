@echo off
echo Copying audio file...
copy "sounds\raone.mp3" "frontend\public\sounds\raone.mp3"
if %errorlevel% equ 0 (
    echo Success! Audio file copied.
) else (
    echo Failed to copy audio file.
)
pause
