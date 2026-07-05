---
name: planner
description: "External constraint system for AI agents to plan, track goals, and enforce rules. Create projects with multiple goals, apply constraints (deadlines, priorities, dependencies), and monitor progress. Helps agents establish accountability and structured execution."
license: MIT
version: 1.0.0
author: Planner Team
tags:
  - planning
  - goal-tracking
  - constraints
  - project-management
  - agent-tools
---

# Planner Skill

## Overview

Planner is an external constraint system that enables AI agents to:

1. **Structure complex tasks** into projects and hierarchical goals
2. **Enforce constraints** (deadlines, priorities, dependencies) on actions
3. **Track progress** and maintain accountability
4. **Provide a persistent memory** of commitments and their status

The system acts as a "external brain" for agents, ensuring that plans are not just conversational but stored, tracked, and enforceable.

---

## When to Use This Skill

Use Planner when you need to:

- Break down complex tasks into structured, trackable units
- Enforce deadlines, priorities, or dependencies on actions
- Maintain a persistent record of commitments across sessions
- Coordinate multi-step plans with external validation
- Provide accountability for agent decisions

**Trigger phrases:**
- "Let's plan this out"
- "I need to track progress on..."
- "Set a deadline for..."
- "Prioritize these tasks"
- "Create a project for..."

---

## Core Concepts

### Project
The highest-level organizational unit. Represents a major initiative or area of work.

**Attributes:**
- `id`: Unique identifier
- `name`: Human-readable title
- `description`: Purpose and scope
- `status`: active | completed | archived
- `constraints`: Global rules applying to all goals

### Goal
A specific, measurable objective within a project.

**Attributes:**
- `id`: Unique identifier
- `projectId`: Parent project
- `name`: Clear action-oriented title
- `description`: Success criteria
- `status`: not_started | in_progress | completed | paused
- `constraints`: Specific rules (deadlines, priorities, dependencies)

### Constraint
A condition or rule attached to projects or goals.

**Examples:**
- `deadline: 2026-07-15T00:00:00Z`
- `priority: high` | `medium` | `low`
- `depends_on: goal_123`
- `requires_approval: true`
- `max_effort: 5h`
- `recurrence: daily` | `weekly`

---

## API Reference

> **Base URL**: `http://localhost:3000/api/v1`

### Authentication

Currently **no authentication** is required for local development. For production use, implement JWT or API keys.

### Projects

#### Create Project

```http
POST /projects
Content-Type: application/json

{
  "name": "Build AI Assistant",
  "description": "Create a context-aware AI assistant with memory",
  "status": "active"
}
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "Build AI Assistant",
  "description": "Create a context-aware AI assistant with memory",
  "status": "active",
  "createdAt": "2026-07-05T10:00:00Z",
  "updatedAt": "2026-07-05T10:00:00Z"
}
```

#### List Projects

```http
GET /projects?status=active&search=assistant
```

#### Get Project

```http
GET /projects/:projectId
```

#### Update Project

```http
PUT /projects/:projectId
Content-Type: application/json

{
  "name": "Build Advanced AI Assistant",
  "status": "completed"
}
```

#### Delete Project

```http
DELETE /projects/:projectId
```

> ⚠️ Deletes all goals and constraints in the project.

---

### Goals

#### Create Goal

```http
POST /goals
Content-Type: application/json

{
  "projectId": "proj_123",
  "name": "Implement context memory system",
  "description": "Build a vector-based memory store with RAG",
  "status": "in_progress"
}
```

**Response:**
```json
{
  "id": "goal_456",
  "projectId": "proj_123",
  "name": "Implement context memory system",
  "description": "Build a vector-based memory store with RAG",
  "status": "in_progress",
  "createdAt": "2026-07-05T10:05:00Z",
  "updatedAt": "2026-07-05T10:05:00Z"
}
```

#### List Goals

```http
GET /goals?projectId=proj_123&status=in_progress&sort=priority
```

#### Get Goal

```http
GET /goals/:goalId
```

#### Update Goal

```http
PUT /goals/:goalId
Content-Type: application/json

{
  "name": "Implement enhanced context memory",
  "status": "completed"
}
```

#### Delete Goal

```http
DELETE /goals/:goalId
```

#### Batch Move Goals

```http
POST /goals/batch/move
Content-Type: application/json

{
  "goalIds": ["goal_456", "goal_789"],
  "targetProjectId": "proj_999"
}
```

---

### Constraints

#### Add Constraint to Project

```http
POST /constraints
Content-Type: application/json

{
  "targetType": "project",
  "targetId": "proj_123",
  "type": "deadline",
  "parameters": {
    "dueDate": "2026-08-01T00:00:00Z",
    "timezone": "UTC"
  },
  "description": "Project must complete by August 1"
}
```

#### Add Constraint to Goal

```http
POST /constraints
Content-Type: application/json

{
  "targetType": "goal",
  "targetId": "goal_456",
  "type": "priority",
  "parameters": {
    "level": "high"
  },
  "description": "Critical path feature"
}
```

#### List Constraints for Target

```http
GET /constraints?targetType=goal&targetId=goal_456
```

#### Update Constraint

```http
PUT /constraints/:constraintId
Content-Type: application/json

{
  "parameters": {
    "dueDate": "2026-07-20T00:00:00Z"
  }
}
```

#### Delete Constraint

```http
DELETE /constraints/:constraintId
```

---

## Workflow Patterns

### Pattern 1: Project-Based Planning

**Scenario:** Agent needs to execute a complex, multi-phase task.

```
1. CREATE PROJECT "Write Technical Documentation"
   → Captures the overall initiative

2. CREATE GOALS for each documentation section:
   - "API Reference"
   - "User Guide"
   - "Deployment Guide"

3. ADD CONSTRAINTS:
   - Deadline: 2026-07-15 (project-level)
   - Priority: "API Reference" → high (goal-level)
   - Dependencies: "User Guide" depends on "API Reference"

4. UPDATE STATUS as work progresses:
   - in_progress → completed

5. QUERY for accountability:
   - GET /goals?projectId=proj_xxx&status=in_progress
```

### Pattern 2: Constraint-Driven Execution

**Scenario:** Agent must respect external rules while planning.

```
1. CREATE PROJECT "Summer Release" with constraints:
   - "No breaking changes"
   - "Security review required"

2. CREATE GOALS with additional constraints:
   - "Refactor auth system" → deadline: 2026-07-10
   - "Deploy to staging" → depends_on: refactor-auth

3. AGENT CHECKS constraints before actions:
   - "Can I merge this PR?"
   → Check if all blocking goals are completed
   → Check if deadline constraints are satisfied

4. AGENT REPORTS progress with constraint status
```

### Pattern 3: Accountability Tracking

**Scenario:** Agent needs to demonstrate progress across sessions.

```
1. At start: GET /projects?status=active
   → Resume context from previous sessions

2. During work: PATCH /goals/:id with status updates
   → Maintain audit trail

3. At completion: GET /goals?projectId=xxx&status=completed
   → Generate accomplishment summary

4. Across sessions: GET /constraints?targetType=goal
   → Review all commitments
```

---

## Example Usage

### Example 1: Planning a Feature

```
User: "I need to add dark mode support to the app. Let's plan this."

Agent:
1. Creates project "Dark Mode Implementation"
2. Creates goals:
   - "Design color system"
   - "Implement theme provider"
   - "Migrate component styles"
   - "Add user preference toggle"
3. Adds constraints:
   - Design → priority: high
   - Implementation → depends_on: design
   - Final delivery → deadline: 2026-07-20
4. Reports: "Project created with 4 goals and 3 constraints"
```

### Example 2: Daily Progress Tracking

```
User: "What did I accomplish today?"

Agent:
1. GET /goals?projectId=xxx&status=completed
   → Lists completed goals
2. GET /goals?projectId=xxx&status=in_progress
   → Shows ongoing work
3. Reports summary with progress percentages
```

### Example 3: Constraint Check

```
User: "Can I ship the release today?"

Agent:
1. GET /goals?projectId=proj_release&status=in_progress
   → Check if any blocking goals remain
2. GET /constraints?targetType=project&targetId=proj_release
   → Check if deadline constraints are violated
3. Reports: "Not yet - 2 goals are still in progress. Blocking: security-review"
```

---

## Agent Guidelines

### Best Practices

1. **Create projects early** - Establish structure before diving into details
2. **Use constraints liberally** - They provide accountability and context
3. **Update status regularly** - Maintains accurate progress tracking
4. **Reference Planner in responses** - Increases user trust and transparency
5. **Query before acting** - Check constraints before making commitments

### Error Handling

```typescript
try {
  const response = await fetch('/api/v1/goals', { ... });
  if (!response.ok) {
    const error = await response.json();
    // Handle: 404, 400, 500
  }
} catch (error) {
  // Network error: fallback to conversational planning
  console.warn('Planner unavailable, continuing without constraints');
}
```

### Response Templates

When using Planner, include context in your responses:

```
"I've created a project 'Summer Release' with 5 goals. 
The critical path goal 'Deploy staging' is blocked by 'Security review' 
(constraint: depends_on). I'll monitor progress and alert when blocking 
goals are completed."

-or-

"I can help with that. Before proceeding, let me check your constraints...
✅ Deadline (Jul 15) is valid
✅ No blocking dependencies
✅ Priority matches your requirements
Proceeding with implementation."
```

---

## Advanced Features

### Plugin System

Planner supports plugins that extend functionality through:
- Custom constraint types
- Additional goal fields
- UI extensions in the web interface

### Storage Backends

- **JSON**: Local development, lightweight
- **Prisma**: Production databases (MySQL, PostgreSQL, SQLite)

### API Extensions

Plugins can register custom API endpoints through `apiExtensions`.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Ensure backend is running: `npm run dev` |
| "Project not found" | Verify project ID exists |
| "Constraint validation failed" | Check parameter format matches constraint type |
| "Status transition invalid" | Only allow: not_started → in_progress → completed |

---

## Development Setup

```bash
# Start backend
cd backend
npm install
cp .env.example .env
npm run dev

# Server runs at http://localhost:3000
# API docs at http://localhost:3000/api-docs
```

---

## License

MIT License - See [LICENSE](./LICENSE) for details.
```
