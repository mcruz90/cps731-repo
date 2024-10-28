# Project Setup Instructions

## Overview

This project is a web application for managing wellness services, including yoga classes, appointments, and financial tracking. It is built using React for the frontend and Express with MySQL for the backend.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 14 or higher)
  - You can download it from [Node.js official website](https://nodejs.org/).
- **Git**
  - Install Git from [Git official website](https://git-scm.com/).
- **MySQL**
  - Install MySQL from [MySQL official website](https://www.mysql.com/).

## Cloning the Repository

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the repository.
3. Run the following command to clone the repository:

   ```bash
   git clone https://github.com/mcruz90/cps731-repo.git
   ```

4. Navigate into the cloned directory:

   ```bash
   cd cps731-repo
   ```

## Setting Up the Backend

1. Navigate to the backend directory:

   ```bash
   cd server
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and add the following environment variables:

   ```plaintext
   PORT=5000
   USE_LEGACY_PHP=true
   PHP_SERVER_URL=http://localhost:8000

   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret
   ```

   **Note:** The above values are dummy details. No actual database setup is required at this time, as the database will be configured later. Ensure to replace these placeholders with actual values when the database is ready.

4. Start the backend server:

   ```bash
   npm start
   ```

## Setting Up the Frontend

1. Open a new terminal window and navigate to the frontend directory:

   ```bash
   cd client
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm start
   ```

4. Open your web browser and navigate to `http://localhost:3000` to view the application.

## Additional Notes

- Ensure that both the backend and frontend servers are running simultaneously for the application to function correctly.
- If you encounter any issues, please check the console for error messages and consult the team for assistance.

## Contributing

If you would like to contribute to this project, please follow the standard Git workflow:

1. Create a new branch for your feature or bug fix.
2. Make your changes and commit them with a clear message.
3. Push your changes to the remote repository.
4. Create a pull request for review.
