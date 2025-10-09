# 🚀 Job Board Application - Backend

A complete job board backend system built with Node.js, Express, and PostgreSQL. Supports user authentication, job management, applications, and file uploads.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Validation**: express-validator

## 📋 Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Candidate/Recruiter)

### 💼 Job Management
- Create, read, update, delete job postings
- Public job listings
- Ownership-based job modifications

### 📝 Application System
- Job applications with duplicate prevention
- Application status tracking (pending, reviewing, accepted, rejected)
- Candidate application history

### 📁 File Management
- Resume upload and management
- File type and size validation
- Automatic cleanup of old files

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/job-board-app.git
cd job-board-app/backend