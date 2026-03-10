# Test PDF to Text conversion via API

$pdfPath = "test.pdf"
$outputDir = "test_results"

# Create output directory
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Create FormData with PDF file
$boundary = [guid]::NewGuid().ToString()
$body = @()

# Read PDF file
$fileBytes = [System.IO.File]::ReadAllBytes($pdfPath)
$formDataStart = "`r`n--$boundary`r`nContent-Disposition: form-data; name=`"image`"; filename=`"test.pdf`"`r`nContent-Type: application/pdf`r`n`r`n"
$formDataEnd = "`r`n--$boundary`r`nContent-Disposition: form-data; name=`"config`"`r`nContent-Type: application/json`r`n`r`n{`"from_format`":`"pdf`",`"to_format`":`"txt`",`"options`":{`"language`":`"eng`"}}`r`n--$boundary--"

# Build multipart form data
$bodyBytes = @()
$bodyBytes += [System.Text.Encoding]::UTF8.GetBytes($formDataStart)
$bodyBytes += $fileBytes
$bodyBytes += [System.Text.Encoding]::UTF8.GetBytes($formDataEnd)

Write-Host "Testing PDF → TXT conversion via API..."
Write-Host "File: $pdfPath"
Write-Host "Size: $([System.Math]::Round($fileBytes.Length / 1MB, 2))MB"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/convert" `
        -Method POST `
        -Body $bodyBytes `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -TimeoutSec 60 `
        -ErrorAction Stop

    Write-Host "✓ Response Status: $($response.StatusCode)"
    Write-Host "✓ Content Type: $($response.Headers['Content-Type'])"
    
    $outputPath = Join-Path $outputDir "output.txt"
    [System.IO.File]::WriteAllBytes($outputPath, $response.Content)
    
    Write-Host "✓ Output saved: $outputPath"
    Write-Host "✓ Output size: $([System.Math]::Round([System.IO.File]::ReadAllBytes($outputPath).Length / 1KB, 2))KB"
    
    # Show first 200 characters of output
    $textContent = [System.Text.Encoding]::UTF8.GetString($response.Content)
    Write-Host ""
    Write-Host "Output preview:"
    Write-Host $textContent.Substring(0, [Math]::Min(200, $textContent.Length))
    
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)"
}
