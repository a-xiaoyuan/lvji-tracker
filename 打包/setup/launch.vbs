' Lvji launcher: start the local helper (hidden) if needed, then open the app window.
' Usage: wscript launch.vbs jobs | ruye   (written by install.ps1, paths filled in for this PC)
Option Explicit
Dim sh, fso, here, which, i, token, url, ts
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
which = "jobs"
If WScript.Arguments.Count > 0 Then which = LCase(WScript.Arguments(0))

Const NODE = "__NODE__"
Const EDGE = "__EDGE__"

Function Alive()
  Dim x
  On Error Resume Next
  Set x = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  x.setTimeouts 400, 400, 400, 400
  x.open "GET", "http://127.0.0.1:47321/api/health", False
  x.send
  Alive = (Err.Number = 0)
  If Alive Then Alive = (x.status = 200)
  On Error GoTo 0
End Function

If Not Alive() Then
  sh.Run """" & NODE & """ """ & here & "\server.mjs""", 0, False
  For i = 1 To 60
    WScript.Sleep 150
    If Alive() Then Exit For
  Next
  If Not Alive() Then
    MsgBox "履迹的后台助手没能启动。" & vbCrLf & "可能是 Node.js 被卸载了，或者 47321 端口被别的程序占用。重新运行一次安装包里的「安装或更新」试试。", 48, "履迹"
    WScript.Quit 1
  End If
End If

token = ""
If fso.FileExists(here & "\token.txt") Then
  Set ts = fso.OpenTextFile(here & "\token.txt", 1)
  token = Trim(ts.ReadAll)
  ts.Close
End If
url = "http://127.0.0.1:47321/jobs/#k=" & token
If which = "ruye" Then url = url & "&v=resume"

If EDGE <> "" And fso.FileExists(EDGE) Then
  sh.Run """" & EDGE & """ --app=" & url & " --window-size=1440,900", 1, False
Else
  sh.Run "explorer """ & url & """", 1, False
End If
