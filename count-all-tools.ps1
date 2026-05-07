$main = (Get-Content app/data/tools.ts | Select-String -Pattern '^\s*(id:)' | Measure-Object).Count
$ai = (Get-Content app/lib/ai-tools.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count
$pdf = (Get-Content app/lib/pdf-tools.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count
$video = (Get-Content app/lib/video-tools.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count
$code = (Get-Content app/lib/code-tools.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count
$data = (Get-Content app/lib/data-tools.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count
$image = (Get-Content app/lib/image-tools-registry.ts | Select-String -Pattern '^\s*(id:|key:)' | Measure-Object).Count

Write-Host "=== TOOL COUNT BY LIBRARY ===" -ForegroundColor Cyan
Write-Host "Main Tools (tools.ts):           $main"
Write-Host "AI Tools (ai-tools.ts):          $ai"
Write-Host "PDF Tools (pdf-tools.ts):        $pdf"
Write-Host "Video Tools (video-tools.ts):    $video"
Write-Host "Code Tools (code-tools.ts):      $code"
Write-Host "Data Tools (data-tools.ts):      $data"
Write-Host "Image Tools (image-tools.ts):    $image"
Write-Host ""

$toolsTotal = $main + $ai + $pdf + $video + $code + $data + $image
Write-Host "Total Tool Entries: $toolsTotal" -ForegroundColor Yellow

# Add sitemap components
Write-Host ""
Write-Host "=== SITEMAP URL COMPONENTS ===" -ForegroundColor Cyan
Write-Host "1. Homepage:                1"
Write-Host "2. Main Tools Pages:        $main"
Write-Host "3. Nested Tools Pages:      $($ai + $pdf + $video + $code + $data + $image)"
Write-Host "4. Category Pages:          12 (approximately)"
Write-Host ""

$sitemapTotal = 1 + $main + ($ai + $pdf + $video + $code + $data + $image) + 12
Write-Host "=== TOTAL EXPECTED SITEMAP URLS: $sitemapTotal ===" -ForegroundColor Green
