# 🎯 CrediSkill – A Trust-Based Freelance Platform

[![Java](https://img.shields.io/badge/Java-8+-ED8B00?style=flat-square&logo=java)](https://www.java.com)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-blue?style=flat-square&logo=mysql)](https://www.mysql.com)
[![HTML5](https://img.shields.io/badge/HTML5-E34C26?style=flat-square&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://www.ecmascript.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](README.md)

> **A Proof-Driven Micro-Skill E-Commerce & Credibility Management System** – A trust-based freelance marketplace enabling secure skill trading with a comprehensive credibility scoring engine.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Proposed Solution](#-proposed-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Frontend Features](#-frontend-features)
- [Backend Features](#-backend-features)
- [Database Design](#-database-design)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Database Setup](#-database-setup-mysql)
- [Running the Backend](#-running-the-java-backend-server)
- [Running the Frontend](#-running-the-frontend)
- [User Workflow](#-user-workflow)
- [Credibility Score Engine](#-credibility-score-engine)
- [Secret Admin Gateway](#-secret-admin-gateway)
- [3D Avatar Integration](#-3d-avatar-integration-threejs)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🎯 Project Overview

**CrediSkill** is an innovative trust-based freelance marketplace that revolutionizes how freelancers and clients connect. Built using a three-layer architecture (Frontend: HTML/CSS/JS, Backend: Core Java, Database: MySQL), CrediSkill emphasizes **trust, credibility, and secure transactions**.

The platform leverages a **dynamic credibility scoring engine** that builds trust profiles based on user behavior, completed projects, and community ratings. Each user's credibility score is visible to potential clients/employers, creating a transparent and trustworthy ecosystem.

**Key Highlights:**
- ✅ Zero external frameworks (no Spring Boot, no Servlets)
- ✅ Custom Java HTTP Server implementation
- ✅ Real-time credibility scoring
- ✅ Interactive 3D user avatars
- ✅ Comprehensive analytics dashboard
- ✅ Secret admin gateway for platform management

---

## 🔴 Problem Statement

Current freelance platforms face several challenges:

1. **Lack of Trust & Transparency** – Limited visibility into freelancer credibility beyond basic ratings
2. **Complex Verification Process** – Lengthy email verification and identity confirmation
3. **Information Overload** – Difficult to assess freelancer quality at a glance
4. **Poor Project Management** – Unclear project workflow and order status tracking
5. **Limited Analytics** – Insufficient real-time insights into freelancer performance
6. **Security Concerns** – Insufficient user authentication and data protection mechanisms
7. **Skill Verification** – No structured way to verify claimed skills

---

## 💡 Proposed Solution

CrediSkill addresses these challenges through:

### 🔐 Trust-Based Architecture
- **Credibility Score Engine**: Automated scoring based on completed projects, ratings, and activity history
- **User Profiles**: Comprehensive profiles with skill verification and rating history
- **Activity Logs**: Complete transaction history for transparency

### 🚀 Enhanced Features
- **Dual-Role System**: Users can be both freelancers and clients
- **Smart Job Posting**: Clear requirements and budget specifications
- **Proposal Management**: Efficient freelancer-to-client communication
- **Order Tracking**: Real-time project status updates
- **Analytics Dashboard**: Visual insights into performance metrics
- **Secret Admin Gateway**: Administrative controls for platform management

### 🎨 User Experience
- **Interactive 3D Avatars**: Personalized user profiles with Three.js avatars
- **Responsive Design**: Mobile-friendly interface
- **Smooth Animations**: GSAP-powered animations for enhanced UX
- **Real-time Analytics**: Chart.js powered performance dashboards

---

## ⭐ Key Features

| Feature | Description |
|---------|-------------|
| 👤 **User Management** | Registration, email verification, dual-role support (Freelancer/Client) |
| 📧 **Email Verification** | SMTP-based email verification for account security |
| 💼 **Job Posting** | Post jobs with detailed requirements and budget |
| 💬 **Proposal System** | Freelancers submit proposals with custom pricing |
| 📋 **Order Management** | Complete order lifecycle: posting → proposals → acceptance → completion |
| ⭐ **Review & Rating** | Rate and review completed projects |
| 🏆 **Credibility Scoring** | Dynamic credibility score based on performance metrics |
| 📊 **Analytics Dashboard** | Real-time performance charts and statistics |
| 🔐 **Admin Panel** | Secret gateway for administrative tasks and platform management |
| 🎨 **3D Avatars** | Interactive Three.js powered user avatars |
| 📢 **Announcements** | Platform-wide announcements and notifications |
| 📸 **Profile Uploads** | Upload and manage profile images |
| 🔧 **Skill Management** | Add, edit, and manage professional skills |
| 📝 **Activity Logging** | Complete audit trail of all user activities |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Frontend)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HTML5 → CSS3 → JavaScript (Vanilla JS)               │
│  ├── index.html (Landing Page)                        │
│  ├── login.html (Authentication)                       │
│  ├── register.html (User Registration)                │
│  ├── marketplace.html (Browse Services)               │
│  ├── profile.html (User Dashboard)                     │
│  ├── addskill.html (Post Skills/Services)            │
│  ├── admin.html (Secret Admin Panel)                 │
│  ├── script.js (Core Logic)                           │
│  ├── animations.js (GSAP Animations)                 │
│  ├── style.css (Styling)                              │
│  └── 3D Avatar Integration (Three.js)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
              ↕ (HTTP/REST API calls)
┌─────────────────────────────────────────────────────────┐
│                APPLICATION LAYER (Backend)             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Core Java (No Frameworks)                            │
│  Custom HTTP Server (com.sun.net.httpserver)         │
│  ├── Server.java (HTTP Request Handler)              │
│  ├── User.java (User Operations)                      │
│  ├── Job.java (Job Management)                        │
│  ├── Proposal.java (Proposal Processing)             │
│  ├── Order.java (Order Lifecycle)                     │
│  ├── Review.java (Rating System)                      │
│  ├── Skill.java (Skill Management)                    │
│  ├── CredibilityScore.java (Scoring Engine)          │
│  ├── DBConnection.java (JDBC Connection Pool)        │
│  ├── EmailSender.java (SMTP Email Service)           │
│  ├── Announcement.java (Notifications)               │
│  ├── ActivityLog.java (Audit Trail)                  │
│  └── SetupDB.java (Database Initialization)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
              ↕ (JDBC Connection)
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER (Database)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MySQL Database (crediskill_db)                       │
│  ├── users (User profiles & credentials)             │
│  ├── skills (Service/Skill listings)                 │
│  ├── jobs (Job postings)                             │
│  ├── proposals (Freelancer proposals)                │
│  ├── orders (Transactions)                           │
│  ├── reviews (Ratings & feedback)                    │
│  ├── credibility_scores (Performance metrics)        │
│  ├── announcements (Platform messages)               │
│  └── activity_logs (User activities)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend Technologies**
| Technology | Purpose | Version |
|-----------|---------|---------|
| **HTML5** | Markup & Structure | Latest |
| **CSS3** | Styling & Responsive Design | Latest |
| **JavaScript (Vanilla)** | Client-side Logic | ES6+ |
| **Three.js** | 3D Avatar Rendering | Latest |
| **GSAP** | Advanced Animations | Latest |
| **Chart.js** | Analytics & Charts | Latest |

### **Backend Technologies**
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Java SE** | Core Application Logic | JDK 8+ |
| **HttpServer** | Custom HTTP Server | Java SDK Built-in |
| **JDBC** | Database Connectivity | Java SDK Built-in |
| **JavaMail API** | Email Verification | Latest |
| **UUID** | Unique Identifiers | Java SDK Built-in |

### **Database**
| Technology | Purpose | Version |
|-----------|---------|---------|
| **MySQL** | Relational Database | 5.7+ |
| **MySQL JDBC Driver** | Java-MySQL Connection | 8.0.33+ |

### **Architecture Pattern**
- **Three-Layer Architecture** (Presentation → Business Logic → Data Access)
- **REST-style APIs** (HTTP GET, POST, PUT, DELETE)
- **MVC Pattern** (Model-View-Controller)

---

## 🎨 Frontend Features

### **User Interface Components**
- ✅ **Responsive Navigation Bar** – Easy access to all features
- ✅ **Hero Landing Page** – Engaging introduction with call-to-action
- ✅ **Dynamic Dashboard** – Personalized user statistics
- ✅ **Marketplace Grid** – Browse available skills/services
- ✅ **Search & Filter** – Find services by category, rating, price
- ✅ **Interactive Forms** – Registration, login, job posting
- ✅ **Real-time Notifications** – Order updates and messages
- ✅ **Analytics Charts** – Visual performance metrics
- ✅ **3D Avatar Display** – Interactive user profile avatars

### **Key Pages**
1. **index.html** – Landing page with platform overview
2. **login.html** – User authentication
3. **register.html** – New user registration with email verification
4. **marketplace.html** – Browse and purchase services
5. **profile.html** – User dashboard with stats and history
6. **addskill.html** – Post new skills/services
7. **admin.html** – Secret admin control panel

### **Frontend Libraries**
- Three.js (3D Graphics)
- GSAP (Animations)
- Chart.js (Analytics)
- Vanilla JavaScript (No frameworks)

---

## ⚙️ Backend Features

### **Core Functionalities**
- ✅ **Custom HTTP Server** – Handles all client requests
- ✅ **User Authentication** – UUID-based session management
- ✅ **Request Routing** – Smart endpoint mapping
- ✅ **Response Serialization** – JSON-based API responses
- ✅ **Database Operations** – JDBC-based CRUD operations
- ✅ **Email Services** – SMTP for verification and notifications
- ✅ **Error Handling** – Comprehensive exception management
- ✅ **Logging** – Activity tracking and debugging

### **Main Classes & Responsibilities**

| Class | Responsibility |
|-------|-----------------|
| **Server.java** | HTTP server management and request routing |
| **DBConnection.java** | MySQL connection pooling and management |
| **User.java** | User registration, login, profile management |
| **Job.java** | Job posting, updating, and retrieval |
| **Proposal.java** | Proposal submission and evaluation |
| **Order.java** | Order lifecycle management |
| **Review.java** | Rating and review system |
| **Skill.java** | Skill creation and management |
| **CredibilityScore.java** | Dynamic scoring engine |
| **EmailSender.java** | Email verification and notifications |
| **Announcement.java** | Platform announcements |
| **ActivityLog.java** | User activity tracking |

### **API Communication**
- **Method**: HTTP POST/GET
- **Format**: JSON request/response
- **Base URL**: `http://localhost:8080`
- **Authentication**: UUID tokens in request headers

---

## 📊 Database Design

### **Database: crediskill_db**

#### **1. users Table**
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('freelancer', 'client', 'both') DEFAULT 'both',
    full_name VARCHAR(100),
    bio TEXT,
    profile_image_url VARCHAR(255),
    avatar_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **2. skills Table**
```sql
CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    experience_level ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### **3. jobs Table**
```sql
CREATE TABLE jobs (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2),
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    required_skills VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    FOREIGN KEY (client_id) REFERENCES users(user_id)
);
```

#### **4. proposals Table**
```sql
CREATE TABLE proposals (
    proposal_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    proposed_price DECIMAL(10, 2) NOT NULL,
    delivery_days INT,
    description TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id),
    FOREIGN KEY (freelancer_id) REFERENCES users(user_id)
);
```

#### **5. orders Table**
```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    proposal_id INT NOT NULL,
    client_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id),
    FOREIGN KEY (client_id) REFERENCES users(user_id),
    FOREIGN KEY (freelancer_id) REFERENCES users(user_id)
);
```

#### **6. reviews Table**
```sql
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewee_id) REFERENCES users(user_id)
);
```

#### **7. credibility_scores Table**
```sql
CREATE TABLE credibility_scores (
    score_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    total_score DECIMAL(5, 2) DEFAULT 0.0,
    completed_projects INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    on_time_completion_rate DECIMAL(5, 2) DEFAULT 0.0,
    customer_satisfaction_rate DECIMAL(5, 2) DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

#### **8. announcements Table**
```sql
CREATE TABLE announcements (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);
```

#### **9. activity_logs Table**
```sql
CREATE TABLE activity_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 📁 Project Structure

```
CrediSkill_Project/
│
├── 📄 README.md                 # Project documentation
├── 📄 compile.bat              # Windows compilation script
├── 📄 run.bat                  # Windows execution script
├── 📄 generate-avatar.js       # Avatar generation utility
├── 📄 embed-avatar.js          # Avatar embedding utility
│
├── 📂 backend/                 # Backend Java Application
│   ├── Server.java             # HTTP Server & Request Handler
│   ├── DBConnection.java       # Database Connection Management
│   ├── User.java               # User Operations
│   ├── Job.java                # Job Management
│   ├── Proposal.java           # Proposal Handling
│   ├── Order.java              # Order Processing
│   ├── Review.java             # Review & Rating System
│   ├── Skill.java              # Skill Management
│   ├── CredibilityScore.java   # Credibility Scoring Engine
│   ├── EmailSender.java        # Email Verification
│   ├── Announcement.java       # Announcement Management
│   ├── ActivityLog.java        # Activity Logging
│   ├── SetupDB.java            # Database Setup Utility
│   └── FixDB.java              # Database Maintenance
│
├── 📂 database/                # Database Configuration
│   └── schema.sql              # MySQL Schema & Initial Data
│
├── 📂 frontend/                # Frontend Web Application
│   ├── 📄 index.html           # Landing Page
│   ├── 📄 login.html           # Login Page
│   ├── 📄 register.html        # Registration Page
│   ├── 📄 marketplace.html     # Marketplace/Browse Page
│   ├── 📄 profile.html         # User Dashboard
│   ├── 📄 addskill.html        # Add Skill/Service Page
│   ├── 📄 admin.html           # Admin Control Panel
│   ├── 📄 script.js            # Main Application Logic
│   ├── 📄 animations.js        # GSAP Animations
│   ├── 📄 fix_alerts.js        # Alert Utilities
│   ├── 📄 style.css            # Global Styling
│   │
│   ├── 📂 models/              # 3D Models
│   │   └── avatar-data.js      # Avatar Configuration
│   │
│   └── 📂 uploads/             # User Uploads
│       └── profile/            # Profile Images Directory
│
├── 📂 lib/                     # External Libraries & Drivers
│   ├── mysql-connector-j.jar   # MySQL JDBC Driver
│   ├── javax.mail.jar          # JavaMail API
│   └── javax.activation.jar    # Activation Framework
│
└── 📄 .gitignore              # Git Ignore Configuration
```

---

## 🚀 Installation & Setup

### **Prerequisites**

Before you begin, ensure you have the following installed:

- ✅ **Java JDK 8 or higher** – [Download](https://www.oracle.com/java/technologies/javase-downloads.html)
- ✅ **MySQL Server 5.7+** – [Download](https://dev.mysql.com/downloads/mysql/)
- ✅ **MySQL JDBC Driver 8.0.33+** – [Download](https://dev.mysql.com/downloads/connector/j/)
- ✅ **Git** (for version control) – [Download](https://git-scm.com/)

### **System Requirements**
- **OS**: Windows 7+, macOS 10.12+, or Linux
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk Space**: Minimum 500MB
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

---

## 📊 Database Setup (MySQL)

### **Step 1: Create Database**

Open MySQL Command Line or MySQL Workbench and execute:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS crediskill_db;
USE crediskill_db;

-- Run the schema file
SOURCE path/to/database/schema.sql;
```

### **Step 2: Update Database Credentials**

Edit `backend/DBConnection.java` and update:

```java
private static final String DB_URL = "jdbc:mysql://localhost:3306/crediskill_db";
private static final String USER = "root";          // Your MySQL username
private static final String PASSWORD = "password"; // Your MySQL password
```

### **Step 3: Verify Connection**

Run SetupDB utility:
```bash
java -cp ".;lib/*" backend.SetupDB
```

Expected output:
```
Database connection successful!
All tables created successfully.
```

### **Step 4: Load Sample Data (Optional)**

```sql
USE crediskill_db;

-- Insert sample users
INSERT INTO users (username, email, password_hash, role, full_name, email_verified)
VALUES 
('john_doe', 'john@example.com', 'hash123', 'both', 'John Doe', TRUE),
('jane_smith', 'jane@example.com', 'hash456', 'both', 'Jane Smith', TRUE);
```

---

## 🖥️ Running the Java Backend Server

### **Step 1: Navigate to Project Directory**

```bash
cd path/to/CrediSkill_Project
```

### **Step 2: Compile Java Files**

**Windows:**
```batch
javac -cp "lib/*" backend/*.java
```

**macOS/Linux:**
```bash
javac -cp "lib/*" backend/*.java
```

### **Step 3: Start the Backend Server**

**Windows (using batch file):**
```batch
run.bat
```

**Windows (manual command):**
```batch
java -cp ".;lib/*" backend.Server
```

**macOS/Linux:**
```bash
java -cp ".:lib/*" backend.Server
```

### **Step 4: Verify Server is Running**

Expected console output:
```
═══════════════════════════════════════════════════════════════
        🚀 CrediSkill Server Started Successfully
═══════════════════════════════════════════════════════════════
Server running on: http://localhost:8080
Available endpoints:
  • GET  /
  • POST /api/register
  • POST /api/login
  • POST /api/logout
  • GET  /api/user/{userId}
  • POST /api/job/create
  • GET  /api/jobs
═══════════════════════════════════════════════════════════════
```

### **Step 5: Accessing the Server**

- **Frontend**: [http://localhost:8080/](http://localhost:8080/)
- **API Base URL**: `http://localhost:8080/api/`
- **Admin Panel**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 🌐 Running the Frontend

### **Automatic (with Backend Server)**

Once the Java backend server is running, simply open your browser and navigate to:
```
http://localhost:8080/
```

The server automatically serves all frontend files from the `frontend/` directory.

### **Manual (without Backend – Static Files Only)**

If you want to test frontend independently:

**Windows (using batch):**
```batch
# Run Python's simple HTTP server (if Python installed)
python -m http.server 8000
```

Then navigate to:
```
http://localhost:8000/frontend/index.html
```

---

## 👥 User Workflow

### **Complete User Journey**

```
┌─────────────────────────────────────────────────────┐
│  1️⃣  NEW USER ARRIVES                              │
│      ↓                                              │
│      Homepage (index.html)                         │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  2️⃣  USER REGISTRATION                             │
│      ↓                                              │
│      Register Page (register.html)                 │
│      → Fill details, select role (Freelancer/Client)
│      → System sends email verification link       │
│      → User clicks link to verify email           │
│      ✅ Account Created                            │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  3️⃣  USER LOGIN                                    │
│      ↓                                              │
│      Login Page (login.html)                       │
│      → Enter credentials                           │
│      → System validates & creates session         │
│      ✅ Logged In                                  │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  4️⃣  DASHBOARD ACCESS                              │
│      ↓                                              │
│      Profile Page (profile.html)                   │
│      → View credibility score                      │
│      → See activity history                        │
│      → Upload profile image                        │
│      → View analytics dashboard                    │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  5️⃣  AS FREELANCER: ADD SKILLS                     │
│      ↓                                              │
│      Add Skill Page (addskill.html)               │
│      → Enter skill name, description, category    │
│      → Set pricing & availability                 │
│      ✅ Skill Listed                               │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  6️⃣  AS CLIENT: POST JOB / BROWSE MARKETPLACE      │
│      ↓                                              │
│      Option A: Post Job                            │
│      → Navigate to job posting                     │
│      → Fill job details, budget, requirements     │
│      ✅ Job Posted                                 │
│      ↓                                              │
│      Option B: Browse Marketplace                 │
│      → Marketplace Page (marketplace.html)        │
│      → Search/filter skills                       │
│      → View freelancer profiles                   │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  7️⃣  FREELANCER SUBMITS PROPOSAL                   │
│      ↓                                              │
│      Freelancer views job                          │
│      → Submits proposal with custom price & terms │
│      → System sends notification to client        │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  8️⃣  CLIENT REVIEWS & ACCEPTS PROPOSAL             │
│      ↓                                              │
│      Client reviews proposals                      │
│      → Checks freelancer credibility score        │
│      → Reviews past work & ratings                │
│      → Accepts preferred proposal                 │
│      ✅ Order Created                              │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  9️⃣  PROJECT EXECUTION                             │
│      ↓                                              │
│      Freelancer starts work                        │
│      → Provides updates                            │
│      → Client monitors progress                    │
│      → Real-time order status tracking             │
│      ↓                                              │
├─────────────────────────────────────────────────────┤
│  🔟  PROJECT COMPLETION & REVIEW                    │
│      ↓                                              │
│      Freelancer marks project complete             │
│      → Client reviews deliverables                 │
│      → Client rates & reviews freelancer          │
│      → System updates credibility score            │
│      ✅ Order Completed                            │
│      ↓                                              │
│  ✅  TRANSACTION COMPLETE                          │
│      → Credibility scores updated                 │
│      → Activity logs recorded                     │
│      → Both users can proceed to next projects    │
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🏆 Credibility Score Engine

### **Overview**

The Credibility Score Engine is the heart of CrediSkill's trust system. It dynamically calculates a user's credibility based on multiple factors, providing transparency and accountability.

### **Scoring Formula**

```
Total Credibility Score = (Weighted Average of Components)

Components:
├── Completion Rate (40%)
│   └── (Completed Projects / Total Projects Accepted)
│
├── Average Rating (35%)
│   └── (Sum of All Ratings / Total Reviews)
│
├── On-Time Delivery (15%)
│   └── (Projects Completed On Time / Total Projects)
│
└── Customer Satisfaction (10%)
    └── (Positive Reviews / Total Reviews)

Score Range: 0.0 - 100.0 (where 100 = Perfect Reputation)
```

### **Score Interpretation**

| Score Range | Status | Badge |
|-----------|--------|-------|
| 90-100 | ⭐⭐⭐⭐⭐ Excellent | Trusted Professional |
| 80-89 | ⭐⭐⭐⭐ Very Good | Reliable Freelancer |
| 70-79 | ⭐⭐⭐ Good | Competent Worker |
| 60-69 | ⭐⭐ Fair | Developing Professional |
| Below 60 | ⭐ Poor | New/Problematic Account |

### **Score Updates**

- **Trigger Points**: Project completion, review submission, order cancellation
- **Recalculation**: Real-time upon event
- **Visibility**: Public on all user profiles
- **Impact**: Affects job visibility and client trust

### **Key Metrics Tracked**

```java
// Credibility Metrics
completed_projects        // Total successful projects
average_rating           // Mean rating (1-5 stars)
on_time_completion_rate  // Percentage of on-time delivery
customer_satisfaction    // Positive feedback percentage
total_reviews            // Number of reviews received
response_time            // Average response to proposals
refund_rate              // Percentage of cancelled/disputed orders
```

---

## 🔐 Secret Admin Gateway

### **Overview**

The Admin Gateway is a hidden administrative panel for platform management and monitoring. Access is restricted to authorized administrators.

### **Admin Access**

**URL**: `http://localhost:8080/admin.html`

### **Admin Features**

#### **1. User Management**
- ✅ View all registered users
- ✅ Search and filter users
- ✅ View user profiles and activity history
- ✅ Manage user roles and permissions
- ✅ Suspend or ban problematic users
- ✅ View credibility scores

#### **2. Job & Order Management**
- ✅ Monitor all posted jobs
- ✅ Track active orders
- ✅ View completed projects
- ✅ Handle disputes and appeals
- ✅ Approve/reject job postings
- ✅ Monitor order completion rates

#### **3. System Analytics**
- ✅ Total users, jobs, and orders
- ✅ Average credibility score
- ✅ Platform activity trends
- ✅ Revenue and transaction analytics
- ✅ User growth metrics
- ✅ Popular skills and categories

#### **4. Announcements**
- ✅ Post platform-wide announcements
- ✅ Send notifications to users
- ✅ Schedule maintenance alerts
- ✅ Broadcast important updates

#### **5. Database Utilities**
- ✅ Export data reports
- ✅ View activity logs
- ✅ Manage platform settings
- ✅ Reset demo data

### **Admin Security**

⚠️ **Important Security Notes:**

1. Change default admin credentials immediately after setup
2. Admin credentials stored in `backend/DBConnection.java`
3. All admin actions are logged in `activity_logs` table
4. Admin access should be restricted to trusted personnel only
5. Consider implementing IP whitelisting for admin access

```java
// Default Admin Credentials (CHANGE IMMEDIATELY)
private static final String ADMIN_USERNAME = "admin";
private static final String ADMIN_PASSWORD = "admin123"; // ⚠️ CHANGE THIS!
```

---

## 🎨 3D Avatar Integration (Three.js)

### **Overview**

CrediSkill features interactive 3D avatars powered by Three.js, providing users with personalized profile representations.

### **Avatar Generation**

#### **1. Generate Avatar**

```bash
node generate-avatar.js
```

This script creates unique 3D avatars for users with customizable features:
- Face shape
- Hair style
- Skin tone
- Clothing
- Accessories

#### **2. Embed Avatar**

```bash
node embed-avatar.js
```

Embeds generated avatars into user profiles and displays them in:
- Dashboard
- Profile page
- Marketplace listings
- Admin panel

### **Avatar Features**

```javascript
// Avatar Configuration (models/avatar-data.js)
{
  userId: 123,
  avatarModel: 'avatar-model-123.glb',
  customizations: {
    skinTone: '#f4a460',
    hairStyle: 'curly',
    faceShape: 'round',
    clothing: 'casual',
    accessories: ['glasses', 'beard']
  },
  animationStates: [
    'idle',
    'wave',
    'thumbsup',
    'celebrate'
  ]
}
```

### **Rendering**

Avatars are rendered in WebGL containers on user profiles:

```html
<!-- Profile Avatar Container -->
<div id="avatar-container" style="width:300px; height:300px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="models/avatar-data.js"></script>
<script>
  // Load and render avatar
  loadUserAvatar(userId);
</script>
```

### **Avatar Performance**

- **Polygon Count**: ~10,000 - 50,000 triangles
- **Texture Quality**: 1024x1024 - 2048x2048
- **Load Time**: ~500ms - 1000ms
- **Frame Rate**: 60 FPS on modern browsers

---

## 🔌 API Endpoints

### **Base URL**: `http://localhost:8080/api/`

### **Authentication Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/verify-email` | Verify email address |
| POST | `/resend-verification` | Resend verification email |

### **User Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/{userId}` | Get user profile |
| PUT | `/user/{userId}/update` | Update profile |
| POST | `/user/{userId}/avatar/upload` | Upload avatar |
| GET | `/user/{userId}/credibility` | Get credibility score |
| GET | `/user/{userId}/activity-log` | Get activity history |
| GET | `/user/{userId}/reviews` | Get user reviews |

### **Job Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/job/create` | Create new job |
| GET | `/jobs` | List all jobs |
| GET | `/job/{jobId}` | Get job details |
| PUT | `/job/{jobId}/update` | Update job |
| DELETE | `/job/{jobId}` | Delete job |
| GET | `/job/{jobId}/proposals` | Get job proposals |

### **Proposal Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proposal/create` | Submit proposal |
| GET | `/proposal/{proposalId}` | Get proposal details |
| PUT | `/proposal/{proposalId}/accept` | Accept proposal |
| PUT | `/proposal/{proposalId}/reject` | Reject proposal |
| DELETE | `/proposal/{proposalId}` | Withdraw proposal |

### **Order Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get user orders |
| GET | `/order/{orderId}` | Get order details |
| PUT | `/order/{orderId}/status` | Update order status |
| POST | `/order/{orderId}/mark-complete` | Mark order complete |

### **Review Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/review/create` | Submit review |
| GET | `/review/{reviewId}` | Get review details |
| PUT | `/review/{reviewId}/edit` | Edit review |

### **Skill Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/skill/add` | Add new skill |
| GET | `/skills/{userId}` | Get user skills |
| PUT | `/skill/{skillId}/update` | Update skill |
| DELETE | `/skill/{skillId}` | Delete skill |

---

## 🔒 Security Features

### **Authentication & Authorization**

✅ **Email Verification System**
- Unique verification tokens
- Email verification required for account activation
- SMTP-based email delivery
- Token expiration (24 hours)

✅ **UUID-Based Session Management**
- Unique session identifiers per login
- Session timeout (30 minutes)
- CORS protection enabled
- HTTP-only cookies for tokens

### **Data Protection**

✅ **Password Security**
- Password hashing (SHA-256)
- Salt-based encryption
- Password strength validation
- Secure password reset mechanism

✅ **SQL Injection Prevention**
- Prepared statements for all queries
- Input validation and sanitization
- Parameterized queries throughout

### **Transport Security**

✅ **HTTPS Recommendations**
- Deploy with SSL/TLS certificates
- Redirect HTTP to HTTPS
- Secure cookie transmission
- HSTS headers enabled

### **Data Encryption**

✅ **Sensitive Data Handling**
- Encryption for user passwords
- Secure storage of payment information
- PII data protection
- GDPR compliance measures

### **Activity Monitoring**

✅ **Audit Trail**
- All user actions logged
- Admin access monitoring
- Failed login attempts tracking
- Suspicious activity alerts

### **Rate Limiting**

✅ **API Protection**
- Request rate limiting per IP
- Brute-force protection
- DDoS mitigation measures
- API throttling implemented

---

## 📸 Screenshots

### **Homepage**
```
[Homepage Screenshot Placeholder]
Platform overview, feature highlights, and call-to-action buttons
```

### **User Registration**
```
[Registration Page Screenshot Placeholder]
Registration form with email verification process
```

### **Login Interface**
```
[Login Page Screenshot Placeholder]
User authentication interface with email/password fields
```

### **Marketplace**
```
[Marketplace Screenshot Placeholder]
Browse available skills and services with filtering options
```

### **User Dashboard/Profile**
```
[Profile Dashboard Screenshot Placeholder]
User profile with credibility score, statistics, and 3D avatar
```

### **Admin Panel**
```
[Admin Panel Screenshot Placeholder]
Administrative controls and platform analytics
```

### **3D Avatar**
```
[3D Avatar Screenshot Placeholder]
Interactive Three.js powered user avatar
```

---

## 🚀 Future Enhancements

### **Phase 2 Features**

- 🔄 **Real-Time Messaging System** – In-app chat between users
- 💳 **Payment Gateway Integration** – Stripe/PayPal integration
- 📱 **Mobile App** – Native iOS/Android applications
- 🤖 **AI Recommendation Engine** – Personalized job/freelancer suggestions
- 📊 **Advanced Analytics** – Detailed performance metrics
- 🌍 **Multi-Language Support** – Internationalization
- 🔔 **Push Notifications** – Real-time alerts
- 🎯 **Skill Endorsements** – Peer verification system
- 💰 **Escrow System** – Secure payment holding
- ⭐ **Badges & Achievements** – Gamification elements

### **Technical Improvements**

- 🔄 Migrate to Spring Boot framework for scalability
- 🐳 Docker containerization for deployment
- ☁️ Cloud deployment (AWS/Azure/GCP)
- 📈 Database optimization and indexing
- 🔐 Two-factor authentication (2FA)
- 📧 Webhook integrations
- 🚀 Microservices architecture
- ♻️ API versioning strategy
- 📊 Machine learning for fraud detection
- ⚡ Caching with Redis

---

## 👥 Contributors

### **Project Team**

| Name | Role | GitHub |
|------|------|--------|
| Your Name | Full Stack Developer | [@username](https://github.com/username) |
| Contributor 1 | Backend Developer | [@contributor1](https://github.com/contributor1) |
| Contributor 2 | Frontend Developer | [@contributor2](https://github.com/contributor2) |

### **Acknowledgments**

- 🙏 Special thanks to all contributors
- 📚 Inspired by platforms like Upwork, Fiverr, and Toptal
- 🎓 University project guidance and support

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CrediSkill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS" BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 📞 Support & Contact

For questions, issues, or suggestions:

- 📧 **Email**: support@crediskill.com
- 🐦 **Twitter**: [@CrediSkill](https://twitter.com/crediskill)
- 💬 **Discord**: [Join Community](https://discord.gg/crediskill)
- 📝 **GitHub Issues**: [Report Bug](https://github.com/crediskill/issues)

---

## 📅 Project Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| **Phase 1: MVP** | Months 1-3 | ✅ Completed |
| **Phase 2: Enhancement** | Months 4-6 | 🔄 In Progress |
| **Phase 3: Optimization** | Months 7-9 | 📋 Planned |
| **Phase 4: Deployment** | Months 10-12 | 📋 Planned |

---

## ⭐ Star History

If you find this project useful, please consider giving it a star ⭐

---

<div align="center">

**Made with ❤️ by the CrediSkill Team**

[⬆ Back to Top](#-crediskill--a-trust-based-freelance-platform)

</div>
