# Database Migrations

This directory contains database migration files for the Job Board application.

## Migration Order

Run migrations in the following order:

1. `001_create_users_table.sql` - User accounts and authentication
2. `002_create_jobs_table.sql` - Job postings  
3. `003_create_applications_table.sql` - Job applications

## Running Migrations

### Using PostgreSQL CLI
```bash
psql -U your_username -d your_database -f 001_create_users_table.sql
psql -U your_username -d your_database -f 002_create_jobs_table.sql
psql -U your_username -d your_database -f 003_create_applications_table.sql