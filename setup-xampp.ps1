#!/bin/bash
# Windows PowerShell Script to copy and verify PHP API files
# Run this from your project root directory

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CMS PHP API Setup Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Set paths
$source_api = ".\api"
$xampp_path = "C:\xampp\htdocs\api"

Write-Host "Checking source API folder..." -ForegroundColor Yellow
if (Test-Path $source_api) {
    Write-Host "   ✓ Found: $source_api" -ForegroundColor Green
} else {
    Write-Host "   ✗ Not found: $source_api" -ForegroundColor Red
    exit 1
}

Write-Host "`nTarget XAMPP location: $xampp_path" -ForegroundColor Cyan

# Check if XAMPP htdocs exists
if (-Not (Test-Path "C:\xampp\htdocs")) {
    Write-Host "`n✗ XAMPP not found at C:\xampp\htdocs" -ForegroundColor Red
    Write-Host "   Please install XAMPP first" -ForegroundColor Yellow
    exit 1
}

# Ask for confirmation
Write-Host "`nThis will copy all PHP API files to XAMPP." -ForegroundColor Yellow
$confirm = Read-Host "Continue? (Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

# Backup existing API if it exists
if (Test-Path $xampp_path) {
    $backup_path = "$xampp_path.backup.$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
    Write-Host "`nBacking up existing API to: $backup_path" -ForegroundColor Yellow
    Copy-Item -Path $xampp_path -Destination $backup_path -Recurse
    Remove-Item -Path $xampp_path -Recurse -Force
}

# Copy API files
Write-Host "`nCopying API files..." -ForegroundColor Yellow
Copy-Item -Path $source_api -Destination $xampp_path -Recurse
Write-Host "   ✓ API files copied successfully" -ForegroundColor Green

# Verify structure
Write-Host "`nVerifying file structure..." -ForegroundColor Yellow
$required_files = @(
    "config/db.php",
    "config/cors.php",
    "auth/login.php",
    "auth/signup.php",
    "admin/dashboard.php",
    "admin/users.php",
    "admin/reports.php",
    "academic/admissions.php",
    "academic/courses.php",
    "academic/assignments.php",
    "user/grades.php",
    "user/submissions.php",
    "user/student-dashboard.php",
    "user/lecturer-dashboard.php",
    "user/students.php",
    "user/subjects.php"
)

$missing = 0
foreach ($file in $required_files) {
    $full_path = Join-Path $xampp_path $file
    if (Test-Path $full_path) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file (MISSING)" -ForegroundColor Red
        $missing++
    }
}

Write-Host "`nConfiguration Check:" -ForegroundColor Yellow
$db_config = Get-Content "$xampp_path\config\db.php"
if ($db_config -match "3306") {
    Write-Host "   ✓ Database port: 3306" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Database port might not be 3306" -ForegroundColor Yellow
}

if ($db_config -match "college_management_system") {
    Write-Host "   ✓ Database name: college_management_system" -ForegroundColor Green
}

Write-Host "`n================================" -ForegroundColor Cyan
if ($missing -eq 0) {
    Write-Host "✓ Setup Complete!" -ForegroundColor Green
    Write-Host "All files verified successfully." -ForegroundColor Cyan
} else {
    Write-Host "⚠ Setup Incomplete" -ForegroundColor Yellow
    Write-Host "$missing file(s) missing or not found" -ForegroundColor Yellow
}
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start XAMPP (Apache + MySQL)" -ForegroundColor White
Write-Host "2. Run: pnpm install" -ForegroundColor White
Write-Host "3. Run: pnpm run dev" -ForegroundColor White
Write-Host "4. Open: http://localhost:3000/login" -ForegroundColor White
Write-Host "5. Test with: admin@college.com / password123" -ForegroundColor White
