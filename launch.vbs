' ==============================================================================
' Veloce yt-dlp Desktop Control Center - Silent Launcher
' ==============================================================================
Option Explicit

Dim fso, wshShell, scriptDir, command

Set fso = CreateObject("Scripting.FileSystemObject")
Set wshShell = CreateObject("WScript.Shell")

' Accurately retrieve the directory where this script is located
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Set current directory to the project root
wshShell.CurrentDirectory = scriptDir

' Launch development server & Electron app silently without any CMD window
command = "cmd.exe /c ""cd /d """ & scriptDir & """ && npm start"""
wshShell.Run command, 0, False

Set fso = Nothing
Set wshShell = Nothing
