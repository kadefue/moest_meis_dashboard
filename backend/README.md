# M&E Dashboard - Laravel Backend (instructions)

This folder contains a small set of drop-in Laravel files (controllers, routes, migrations)
and instructions to create a full Laravel application.

Quick start (on macOS with Composer & PHP installed):

1. Create a new Laravel project:

```bash
cd /Users/kadefue/MoEST_M_n_E/backend
composer create-project laravel/laravel laravel-app
cd laravel-app
```

2. Copy the files from `laravel-skeleton/` into the matching locations in the Laravel project.

3. Install and run migrations:

```bash
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

4. API endpoints (examples) will be available under `http://127.0.0.1:8000/api/`.

Included skeleton files:
- `routes/api.php` : sample API routes
- `app/Http/Controllers/Api/DashboardController.php` : example controller returning frameworks list
- `database/migrations/2026_01_01_000000_create_frameworks_table.php` : migration for `frameworks` table

If you want me to create the Laravel project here automatically (composer required), tell me and I can run the commands.
