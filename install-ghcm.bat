@echo off
title GHCM Installation Script
echo.
echo ========================================
echo    GHCM - GitHub Clone Manager
echo    Installation Script
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running with administrator privileges...
) else (
    echo [ERROR] This script requires administrator privileges!
    echo [INFO] Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Check if ghcm.exe exists
if not exist "%~dp0dist\ghcm.exe" (
    echo [ERROR] ghcm.exe not found in dist folder!
    echo [INFO] Current directory: %CD%
    echo [INFO] Script directory: %~dp0
    echo [INFO] Please run: pkg bin/ghcm.js --targets node14-win-x64 --output dist/ghcm.exe
    echo.
    pause
    exit /b 1
)

echo [INFO] Found ghcm.exe in dist folder
echo.

REM Create installation directory
set INSTALL_DIR=C:\Program Files\GHCM
echo [INFO] Creating installation directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create installation directory!
        pause
        exit /b 1
    )
)

REM Copy ghcm.exe to installation directory
echo [INFO] Copying ghcm.exe to installation directory...
copy "%~dp0dist\ghcm.exe" "%INSTALL_DIR%\ghcm.exe" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to copy ghcm.exe!
    pause
    exit /b 1
)

REM Copy icon if exists
if exist "%~dp0ghcm.ico" (
    echo [INFO] Copying icon file...
    copy "%~dp0ghcm.ico" "%INSTALL_DIR%\ghcm.ico" >nul
)

REM Add to system PATH
echo [INFO] Adding GHCM to system PATH...
for /f "skip=2 tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "CURRENT_PATH=%%B"

REM Check if CURRENT_PATH is empty
if not defined CURRENT_PATH (
    echo [WARNING] Could not read current PATH, using alternative method...
    set "CURRENT_PATH=%PATH%"
)

REM Check if already in PATH
echo %CURRENT_PATH% | findstr /C:"%INSTALL_DIR%" >nul
if %errorlevel% equ 0 (
    echo [INFO] GHCM is already in system PATH
) else (
    echo [INFO] Adding %INSTALL_DIR% to system PATH...
    setx PATH "%CURRENT_PATH%;%INSTALL_DIR%" /M >nul 2>&1
    if %errorlevel% equ 0 (
        echo [SUCCESS] Successfully added to system PATH!
    ) else (
        echo [WARNING] Failed to add to system PATH automatically.
        echo [INFO] Please add manually: %INSTALL_DIR%
        echo [INFO] Or copy ghcm.exe to C:\Windows\System32\
    )
)

REM Create desktop shortcut
echo [INFO] Creating desktop shortcut...
set DESKTOP=%USERPROFILE%\Desktop
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%DESKTOP%\GHCM.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\ghcm.exe" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "GHCM - GitHub Clone Manager" >> "%TEMP%\CreateShortcut.vbs"
if exist "%INSTALL_DIR%\ghcm.ico" (
    echo oLink.IconLocation = "%INSTALL_DIR%\ghcm.ico" >> "%TEMP%\CreateShortcut.vbs"
)
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"
cscript "%TEMP%\CreateShortcut.vbs" >nul 2>&1
del "%TEMP%\CreateShortcut.vbs" >nul 2>&1

REM Create start menu shortcut
echo [INFO] Creating start menu shortcut...
set STARTMENU=%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs
if not exist "%STARTMENU%\GHCM" mkdir "%STARTMENU%\GHCM"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateStartMenuShortcut.vbs"
echo sLinkFile = "%STARTMENU%\GHCM\GHCM.lnk" >> "%TEMP%\CreateStartMenuShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateStartMenuShortcut.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\ghcm.exe" >> "%TEMP%\CreateStartMenuShortcut.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\CreateStartMenuShortcut.vbs"
echo oLink.Description = "GHCM - GitHub Clone Manager" >> "%TEMP%\CreateStartMenuShortcut.vbs"
if exist "%INSTALL_DIR%\ghcm.ico" (
    echo oLink.IconLocation = "%INSTALL_DIR%\ghcm.ico" >> "%TEMP%\CreateStartMenuShortcut.vbs"
)
echo oLink.Save >> "%TEMP%\CreateStartMenuShortcut.vbs"
cscript "%TEMP%\CreateStartMenuShortcut.vbs" >nul 2>&1
del "%TEMP%\CreateStartMenuShortcut.vbs" >nul 2>&1

REM Add to registry for Add/Remove Programs
echo [INFO] Adding to Add/Remove Programs...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "DisplayName" /t REG_SZ /d "GHCM - GitHub Clone Manager" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "Publisher" /t REG_SZ /d "Beratkan15" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall-ghcm.bat" /f >nul
if exist "%INSTALL_DIR%\ghcm.ico" (
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "DisplayIcon" /t REG_SZ /d "%INSTALL_DIR%\ghcm.ico" /f >nul
) else (
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /v "DisplayIcon" /t REG_SZ /d "%INSTALL_DIR%\ghcm.exe" /f >nul
)

REM Create uninstaller
echo [INFO] Creating uninstaller...
echo @echo off > "%INSTALL_DIR%\uninstall-ghcm.bat"
echo title GHCM Uninstaller >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo echo Uninstalling GHCM... >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo del "%DESKTOP%\GHCM.lnk" ^>nul 2^>^&1 >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo rmdir /s /q "%STARTMENU%\GHCM" ^>nul 2^>^&1 >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\GHCM" /f ^>nul 2^>^&1 >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo echo GHCM has been uninstalled successfully! >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo echo Please restart your terminal to remove PATH changes. >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo pause >> "%INSTALL_DIR%\uninstall-ghcm.bat"
echo del "%%~f0" >> "%INSTALL_DIR%\uninstall-ghcm.bat"

echo.
echo ========================================
echo    INSTALLATION COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo [SUCCESS] GHCM has been installed to: %INSTALL_DIR%
echo [SUCCESS] Added to system PATH
echo [SUCCESS] Desktop shortcut created
echo [SUCCESS] Start menu shortcut created
echo [SUCCESS] Added to Add/Remove Programs
echo.
echo [INFO] You can now use 'ghcm' command in any terminal!
echo [INFO] Please restart your terminal/command prompt for PATH changes to take effect.
echo [INFO] If 'ghcm' command doesn't work, the executable is located at: %INSTALL_DIR%\ghcm.exe
echo.
echo Examples:
echo   ghcm Beratkan15/GHCM
echo   ghcm microsoft/vscode -d my-vscode
echo   ghcm -l tr
echo.
pause
