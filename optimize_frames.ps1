# PowerShell script to reduce hero animation frames from 240 to 120 by keeping every alternate frame (odd-numbered) and renaming sequentially
# Navigate to the frames directory (assumed script is run from project root)
$framesPath = Join-Path -Path $PSScriptRoot -ChildPath 'frames'
Set-Location -Path $framesPath

Write-Host "Current frame files:" (Get-ChildItem -File | Measure-Object).Count

# Step 1: Delete every even-indexed frame (keep odd frames)
$files = Get-ChildItem -Filter 'ezgif-frame-*.jpg' | Sort-Object Name
$index = 1
foreach ($file in $files) {
    if ($index % 2 -eq 0) {
        Write-Host "Removing $($file.Name)"
        Remove-Item -Path $file.FullName -Force
    }
    $index++
}

# Step 2: Rename remaining files to a continuous sequence 001..120
$remaining = Get-ChildItem -Filter 'ezgif-frame-*.jpg' | Sort-Object Name
$counter = 1
foreach ($file in $remaining) {
    $newName = ('ezgif-frame-{0:D3}.jpg' -f $counter)
    if ($file.Name -ne $newName) {
        Write-Host "Renaming $($file.Name) -> $newName"
        Rename-Item -Path $file.FullName -NewName $newName -Force
    }
    $counter++
}

Write-Host "Optimization complete. Total frames now: $counter"
