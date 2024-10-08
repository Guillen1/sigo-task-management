# Sigo Task Management System

## Overview

This project is a Task Management System built using NestJS. The system provides CRUD operations for tasks, which include creating, reading, updating, and deleting tasks. The system also implements caching using Redis to optimize performance, utilizing the CQRS (Command Query Responsibility Segregation) pattern to separate the read and write operations.

## Features

- **Task Model**: The system manages tasks with the following properties:
  - `id` (UUID)
  - `title` (string)
  - `description` (string)
  - `status` (enum: `pending`, `in-progress`, `completed`)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)
- **CRUD Operations**: Create, read, update, and delete tasks.
- **Caching**: Uses Redis to cache task data and optimize read performance.
- **CQRS Pattern**: Separates command and query responsibilities, improving the scalability and maintainability of the system.
- **Error Handling**: Comprehensive error handling, including custom exceptions and validation.
- **Swagger Documentation**: API documentation generated with Swagger.

## Architecture

### NestJS Modules

- **Tasks Module**: This module handles all operations related to tasks, including CRUD operations and caching. It includes the following components:
  - **Entities**: Defines the `Task` entity representing tasks in the database.
  - **Controllers**: Handles incoming HTTP requests and returns responses.
  - **Command Handlers**: Implements the command side of CQRS for write operations (create, update, delete).
  - **Query Handlers**: Implements the query side of CQRS for read operations (get tasks).
  - **Cache Manager Service**: Manages the caching of tasks using Redis.

### CQRS Implementation

- **Commands**: Commands are used for operations that change state, such as creating, updating, or deleting tasks.
- **Queries**: Queries are used for retrieving data without altering the state, such as fetching tasks by ID.
- **Handlers**: Command and Query handlers execute the respective operations.

### Caching Strategy

- **Redis**: Caches task data to reduce database load and improve response times. Cached data is invalidated or updated whenever tasks are modified or deleted to ensure consistency.

## Setup Instructions

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v14 or later).
- **Redis**: Install and run Redis using Homebrew.

### Redis Setup with Homebrew

1. **Install Redis**:
   ```bash
   brew install redis
   ```
2. **Install Redis**:

   ```bash
   brew services start redis
   ```

3. **Verify Redis is running**:
   ```bash
   redis-cli ping
   ```

## Local Setup

### Clone the repository:

```bash
git clone https://github.com/Guillen1/sigo-task-management.git
cd task-management
```

### Install dependencies:

```bash
npm install
```

### Running the app

```bash
$ yarn run start

# watch mode
$ yarn run start:dev

# debug mode
$ yarn start:debug

# production mode
$ yarn run start:prod
```

### Tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

### Access the application:

Swagger API documentation is available at [http://localhost:8080/api](http://localhost:8080/api).

## Out of Scope

While the current implementation covers the core functionality of the task management system, the following items have been identified as not included in the initial scope of work but may be considered for future development:

1. **Unique Titles for Tasks:**

   - **Business Logic:** Enforcing unique titles across all tasks is currently not implemented. In future iterations, this could be added to prevent duplicate task titles, ensuring better organization and avoiding confusion.

2. **Status Transition Rules:**

   - **Business Logic:** Specific rules for transitioning between task statuses (e.g., from "Pending" to "Completed") have not been defined. Implementing status transition rules could enhance the system by preventing invalid status changes and maintaining consistent task states.

3. **Pagination on `Get Many` Requests:**
   - **Feature:** Pagination is not currently implemented for retrieving multiple tasks at once. Adding pagination could improve performance and usability, especially when dealing with a large number of tasks.
