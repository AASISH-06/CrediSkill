# CrediSkill Project

A Proof-Driven Micro-Skill E-Commerce & Credibility Management System built using a three-layer architecture (Frontend: HTML/CSS/JS, Backend: Plain Java, Database: MySQL).

## Project Structure
```text
CrediSkill_Project/
├── backend/
│   ├── CredibilityScore.java
│   ├── DBConnection.java
│   ├── Order.java
│   ├── Review.java
│   ├── Server.java (HTTP Server)
│   ├── Skill.java
│   └── User.java
├── database/
│   └── schema.sql
├── frontend/
│   ├── addskill.html
│   ├── index.html
│   ├── login.html
│   ├── marketplace.html
│   ├── profile.html
│   ├── script.js
│   └── style.css
└── lib/
    └── mysql-connector-j-8.0.33.jar (Required to run JDBC)
```

## Prerequisites
1. **Java JDK 8 or higher** installed (`java -version`).
2. **MySQL Server** installed and running.
3. **MySQL JDBC Driver** (Download from [MySQL site](https://dev.mysql.com/downloads/connector/j/) and place the `.jar` file inside the `/lib` folder).

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or your command line.
2. Run the SQL script located at `database/schema.sql` to initialize the `crediskill_db` database and all required tables.
3. Once created, open `backend/DBConnection.java` and modify the `USER` and `PASSWORD` constants to match your local MySQL credentials.
   ```java
   private static final String USER = "root"; 
   private static final String PASSWORD = "your_mysql_password"; 
   ```

### 2. Compiling the Java Backend
Open your terminal/command-prompt, navigate to the `CrediSkill_Project` folder, and run:
```bash
# Windows
javac -cp "lib/*" backend/*.java
```

### 3. Running the Server
Start the plain Java HTTP server which will handle API requests and serve frontend files.
```bash
# Windows
java -cp ".;lib/*" backend.Server
```
You should see output: `Starting CrediSkill server on port 8080`.

### 4. Accessing the Frontend
Open your web browser and navigate to:
[http://localhost:8080/](http://localhost:8080/)

From there you can test the full flow:
1. Register a new Dual/Freelancer account.
2. Login to the application.
3. Go to "Add Skill" to post a new service.
4. Go to "Marketplace" to view skills and purchase them (as a different client user).
5. Watch your credibility score dynamically adjust in your Dashboard profile based on successful setups.

## Note on Architecture
To strictly comply with the requirement of avoiding external frameworks (like Spring Boot or even Servlets), the backend utilizes standard Java SDK's `com.sun.net.httpserver.HttpServer` to facilitate frontend-to-backend communication without relying on manual console inputs.
