Option Explicit

Dim outputPath, app, presentation, slide, shape
If WScript.Arguments.Count <> 1 Then
  WScript.Echo "Usage: cscript //nologo scripts/generate-legacy-ppt.vbs <output.ppt>"
  WScript.Quit 2
End If

outputPath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName(WScript.Arguments(0))
Set app = CreateObject("PowerPoint.Application")
Set presentation = app.Presentations.Add
Set slide = presentation.Slides.Add(1, 12)
Set shape = slide.Shapes.AddTextbox(1, 36, 36, 480, 60)
shape.TextFrame.TextRange.Text = "SimplifyConvert Audit Slide"
presentation.SaveAs outputPath, 1
presentation.Close
app.Quit
WScript.Echo "Generated legacy PowerPoint fixture: " & outputPath
