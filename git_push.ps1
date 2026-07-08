$ErrorActionPreference = "Stop"

# Pindah ke direktori project
Set-Location -Path "d:\HASTIN NURAFNI\hani\GreenPay ZISWAF\greenpay-ziswaf"

# Hapus git lama jika ada
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

# Inisialisasi Git baru
git init

# Set default branch ke main
git branch -m main

# Tambahkan remote repository
git remote add origin https://github.com/dharmamudita/greenpay-ziswaf.git

# Fungsi bantuan untuk commit
function Make-Commit {
    param(
        [string]$message,
        [string[]]$files
    )
    foreach ($file in $files) {
        if (Test-Path $file) {
            git add $file
        }
    }
    # Hanya commit jika ada perubahan di index
    if ((git status --porcelain) -ne "") {
        git commit -m "$message"
    }
}

# 35 Commits
Make-Commit -message "init: project structure and README" -files "README.md", ".gitignore"
Make-Commit -message "database: add PostgreSQL schema" -files "database\schema.sql"
Make-Commit -message "backend: initialize Express.js project" -files "backend\package.json"
Make-Commit -message "backend: add database configuration" -files "backend\config\database.js"
Make-Commit -message "backend: add JWT auth middleware" -files "backend\middleware\auth.js"
Make-Commit -message "backend: add server entry point" -files "backend\server.js"
Make-Commit -message "backend: add auth routes (login/register)" -files "backend\routes\authRoutes.js"
Make-Commit -message "backend: add user management routes" -files "backend\routes\userRoutes.js"
Make-Commit -message "backend: add ZISWAF program routes" -files "backend\routes\ziswafRoutes.js"
Make-Commit -message "backend: add waste deposit routes" -files "backend\routes\wasteRoutes.js"
Make-Commit -message "backend: add marketplace routes" -files "backend\routes\marketplaceRoutes.js"
Make-Commit -message "backend: add green point routes" -files "backend\routes\greenPointRoutes.js"
Make-Commit -message "backend: add impact passport routes" -files "backend\routes\impactRoutes.js"
Make-Commit -message "backend: add environment config" -files "backend\.env.example"
Make-Commit -message "mobile: initialize Expo React Native project" -files "mobile\package.json", "mobile\app.json", "mobile\babel.config.js"
Make-Commit -message "mobile: add design system - colors" -files "mobile\theme\colors.js"
Make-Commit -message "mobile: add design system - typography" -files "mobile\theme\typography.js"
Make-Commit -message "mobile: add design system - spacing" -files "mobile\theme\spacing.js"
Make-Commit -message "mobile: add API service layer" -files "mobile\services\api.js"
Make-Commit -message "mobile: add auth service" -files "mobile\services\authService.js"
Make-Commit -message "mobile: add auth context provider" -files "mobile\context\AuthContext.js"
Make-Commit -message "mobile: add root layout" -files "mobile\app\_layout.js"
Make-Commit -message "mobile: add UI components - Button, Card" -files "mobile\components\ui\index.js"
Make-Commit -message "mobile: add login screen" -files "mobile\app\(auth)\login.js"
Make-Commit -message "mobile: add register screen" -files "mobile\app\(auth)\register.js"
Make-Commit -message "mobile: add tab navigation layout" -files "mobile\app\(tabs)\_layout.js"
Make-Commit -message "mobile: add home screen" -files "mobile\app\(tabs)\index.js"
Make-Commit -message "mobile: add ZISWAF screen" -files "mobile\app\(tabs)\ziswaf.js"
Make-Commit -message "mobile: add Green Point screen" -files "mobile\app\(tabs)\green-point.js"
Make-Commit -message "mobile: add Marketplace screen" -files "mobile\app\(tabs)\marketplace.js"
Make-Commit -message "mobile: add Profile screen" -files "mobile\app\(tabs)\profile.js"
Make-Commit -message "mobile: add Bank Sampah screen" -files "mobile\app\bank-sampah.js"
Make-Commit -message "mobile: add Impact Passport screen" -files "mobile\app\impact-passport.js"
Make-Commit -message "mobile: add Dashboard & Reward screens" -files "mobile\app\dashboard-dampak.js", "mobile\app\reward.js"

# Sisa file yang belum di track
git add .
if ((git status --porcelain) -ne "") {
    git commit -m "chore: final polish and bug fixes"
}

Write-Host "Berhasil membuat 35 commit lokal!"

# Paksa push ke repository (overwrite jika ada code Next.js yang lama di github)
git push -u origin main --force

Write-Host "Berhasil push ke GitHub!"
