$sitemapUrl = "https://simplifyconvert.com/sitemap.xml"

try {
    Write-Host "Fetching sitemap from production..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri $sitemapUrl -TimeoutSec 30 -ErrorAction Stop
    $content = $response.Content
    
    # Count <loc> tags
    $locCount = ([regex]::Matches($content, '<loc>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
    
    Write-Host ""
    Write-Host "=== PRODUCTION SITEMAP COUNT ===" -ForegroundColor Green
    Write-Host "Total URLs in production sitemap: $locCount" -ForegroundColor Yellow
    Write-Host ""
    
    # Show first 20 URLs
    $lines = $content -split "`n"
    $urls = @()
    foreach ($line in $lines) {
        if ($line -match '<loc>(.+?)</loc>') {
            $urls += $matches[1]
        }
    }
    
    Write-Host "First 20 URLs:"
    for ($i = 0; $i -lt [Math]::Min(20, $urls.Count); $i++) {
        Write-Host "$($i + 1). $($urls[$i])"
    }
    
    Write-Host ""
    Write-Host "Expected from calculation: ~518 URLs" -ForegroundColor Cyan
    Write-Host "Screaming Frog detected: 324 URLs" -ForegroundColor Yellow
    Write-Host "Production shows: $locCount URLs" -ForegroundColor Yellow
    Write-Host ""
    
    if ($locCount -lt 500) {
        Write-Host "ISSUE DETECTED: Sitemap is missing ~$([Math]::Max(0, 518 - $locCount)) URLs" -ForegroundColor Red
        Write-Host "This matches what Screaming Frog found!" -ForegroundColor Red
    } else {
        Write-Host "Sitemap appears complete" -ForegroundColor Green
    }
}
catch {
    Write-Host "Error fetching sitemap: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Hint: If production sitemap is not accessible, the issue might be:" 
    Write-Host "- Deploy has not been updated yet"
    Write-Host "- Production has different tool data"
    Write-Host "- Sitemap generation has a bug in production"
}
