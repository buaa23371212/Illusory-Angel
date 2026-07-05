---
name: planner-advanced
description: "External enforcement system for AI agents. Unlike basic planning tools, this system uses autonomous plugins (Deadline Enforcer, Priority Evaluator, Dependency Watcher) that actively enforce constraints. Agents cannot override constraints - they must obey or be blocked."
license: MIT
version: 2.0.0
author: Planner Team
tags:
  - external-constraints
  - enforcement
  - agent-governance
  - autonomous-plugins
  - accountability
---

# Planner Advanced - External Enforcement System

## Core Philosophy

> **"A constraint that can be ignored is not a constraint."**

This system operates on one principle: **constraints are enforced externally, not suggested internally.**

| Basic Planner | Advanced Planner |
|---------------|-------------------|
| Agent creates constraints | Plugins impose constraints |
| Agent decides to follow | System forces compliance |
| Agent reports progress | System verifies progress |
| Agent can override | Agent cannot override |
| "Soft" suggestions | "Hard" boundaries |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Planner System                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Core Database                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐   │   │
│  │  │ Projects │  │  Goals   │  │     Constraints         │   │   │
│  │  └──────────┘  └──────────┘  │  - type: deadline      │   │   │
│  │                              │  - type: priority       │   │   │
│  │                              │  - type: dependency     │   │   │
│  │                              │  - type: approval       │   │   │
│  │                              │  - type: external_check │   │   │
│  │                              └────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Plugin System                            │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │   Deadline   │  │   Priority   │  │ Dependency  │    │   │
│  │  │   Enforcer   │  │  Evaluator   │  │   Watcher   │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │  Approval    │  │   External   │  │   Resource   │    │   │
│  │  │  Guardian    │  │    Checker   │  │   Monitor    │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Enforcement Layer                         │   │
│  │  - API Gate: Block operations that violate constraints      │   │
│  │  - Audit Log: Record all constraint checks                  │   │
│  │  - Escalation: Alert when constraints are at risk           │   │
│  │  - Automated Actions: Execute without Agent intervention   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Differences from Basic Planner

### 1. Constraint Creation

**Basic**: Agent creates constraints voluntarily.
**Advanced**: Plugins create and enforce constraints autonomously.

```typescript
// Basic: Agent decides
POST /constraints
{
  "type": "deadline",
  "parameters": { "dueDate": "2026-08-01" }
}

// Advanced: Deadline Enforcer plugin imposes
// (Agent cannot remove or modify without approval)
POST /plugins/deadline-enforcer/constraints
{
  "goalId": "goal_456",
  "deadline": "2026-08-01",
  "gracePeriod": "24h",
  "escalation": "notify_owner"
}
```

### 2. Constraint Enforcement

**Basic**: Agent self-reports.
**Advanced**: System actively checks and blocks.

```typescript
// Agent attempts to complete a goal
POST /goals/:id/complete

// Enforcement Layer intercepts:
{
  "blocked": true,
  "reason": "Dependency constraint violated: 'goal_123' is not completed",
  "resolution": "Complete 'goal_123' first, or request dependency override"
}
```

### 3. Escalation

**Basic**: No escalation.
**Advanced**: Autonomous escalation when constraints are at risk.

```typescript
// Deadline Enforcer detects approaching deadline
POST /plugins/deadline-enforcer/check

{
  "goalId": "goal_456",
  "deadline": "2026-08-01",
  "timeRemaining": "2d",
  "status": "warning",
  "actions": [
    {
      "type": "notify",
      "recipient": "agent_owner",
      "message": "Goal approaching deadline. 2 days remaining."
    },
    {
      "type": "escalate",
      "level": "high",
      "action": "schedule_reminder"
    }
  ]
}
```

---

## Core Plugins

### 1. Deadline Enforcer

**Purpose**: Enforce time-based constraints autonomously.

**Behavior**:
- Monitors all goals with deadline constraints
- Checks daily for approaching deadlines
- Escalates when deadlines are at risk
- Blocks completion after deadline passes
- Maintains audit log of all deadline activity

**Configuration**:
```json
{
  "checkInterval": "24h",
  "warningThreshold": "3d",
  "criticalThreshold": "1d",
  "gracePeriod": "24h",
  "escalationActions": ["notify", "assign_priority"]
}
```

**Enforcement Actions**:
| Event | Action |
|-------|--------|
| Deadline approaching (3d) | Send warning notification |
| Deadline approaching (1d) | Mark as "critical" + notify |
| Deadline passed | Block completion + escalate |
| Deadline passed + 24h | Auto-archive goal |

### 2. Priority Evaluator

**Purpose**: Evaluate and assign priority autonomously.

**Behavior**:
- Analyzes goal content and context
- Assigns priority based on configurable criteria
- Re-evaluates when project context changes
- Adjusts priorities across goals for balance
- Prevents Agent from assigning unrealistic priorities

**Evaluation Criteria**:
```json
{
  "criteria": [
    {
      "name": "business_impact",
      "weight": 0.4,
      "analysis": "Does this goal directly impact revenue/users?"
    },
    {
      "name": "dependencies",
      "weight": 0.3,
      "analysis": "How many other goals depend on this?"
    },
    {
      "name": "effort",
      "weight": 0.2,
      "analysis": "Estimated effort required"
    },
    {
      "name": "external_factors",
      "weight": 0.1,
      "analysis": "Regulatory, seasonal, or market factors"
    }
  ]
}
```

**Enforcement Actions**:
| Event | Action |
|-------|--------|
| Agent creates goal | Auto-assign priority |
| Agent changes priority | Re-evaluate and potentially override |
| Dependency changes | Re-prioritize affected goals |
| Context changes | Re-evaluate all priorities |

### 3. Dependency Watcher

**Purpose**: Enforce dependency chains autonomously.

**Behavior**:
- Maps all dependency relationships
- Monitors blocked goals
- Auto-watches for dependency completion
- Blocks actions on blocked goals
- Manages dependency chains and critical paths

**Enforcement Actions**:
| Event | Action |
|-------|--------|
| Goal created with dependencies | Add to watch list |
| Dependency completed | Notify blocked goals |
| Dependency missed | Escalate and re-prioritize |
| Cycle detected | Block and alert |

### 4. Approval Guardian

**Purpose**: Require external approval for certain actions.

**Behavior**:
- Intercepts actions requiring approval
- Routes to designated approver
- Blocks until approval received
- Escalates if approval delayed
- Maintains approval audit log

**Configuration**:
```json
{
  "approvalTriggers": [
    {
      "action": "delete_goal",
      "requiresApproval": true,
      "approver": "project_owner"
    },
    {
      "action": "change_deadline",
      "requiresApproval": true,
      "approver": "project_owner"
    },
    {
      "action": "complete_goal",
      "requiresApproval": false,
      "approver": "self"
    }
  ]
}
```

### 5. Resource Monitor

**Purpose**: Track and enforce resource constraints.

**Behavior**:
- Monitors time, budget, and resource usage
- Enforces allocation limits
- Prevents overallocation
- Reallocates resources autonomously

**Enforcement Actions**:
| Event | Action |
|-------|--------|
| Resource nearly exhausted | Warning + reallocation |
| Resource exhausted | Block new goals |
| Resource overallocated | Auto-rebalance |
| Inefficient allocation | Recommend optimization |

---

## Agent Interface

### Agent Role: The "Executor"

In this system, the Agent is **not the planner** - it is the **executor**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent as Executor                        │
│                                                             │
│  ❌ NOT: "I will create a plan and follow it"              │
│  ✅ IS:  "The system has assigned me tasks. I will execute."│
│                                                             │
│  Agent responsibilities:                                    │
│  1. Query assigned goals                                   │
│  2. Execute work on goals                                  │
│  3. Report completion                                      │
│  4. Request clarification when blocked                     │
│                                                             │
│  Agent CANNOT:                                             │
│  ❌ Override deadlines                                     │
│  ❌ Lower priorities                                       │
│  ❌ Change dependencies                                    │
│  ❌ Ignore constraint violations                           │
└─────────────────────────────────────────────────────────────┘
```

### Agent Commands

```typescript
// 1. Get assigned work
GET /agent/tasks
{
  "assignedGoals": [
    {
      "id": "goal_456",
      "name": "Implement auth system",
      "priority": "high",
      "deadline": "2026-08-01",
      "blockedBy": null
    }
  ]
}

// 2. Report progress
POST /agent/report
{
  "goalId": "goal_456",
  "status": "in_progress",
  "completion": 0.6,
  "nextAction": "Finish user registration flow"
}

// 3. Request unblock
POST /agent/request-unblock
{
  "goalId": "goal_456",
  "reason": "Waiting on API design from dependency goal_123"
}

// 4. Request override (escalated)
POST /agent/request-override
{
  "constraintId": "constraint_789",
  "reason": "External vendor delivered late",
  "proposedChange": "Extend deadline by 3 days"
}
```

---

## Enforcement Scenarios

### Scenario 1: Deadline Enforcement

```
Timeline:
Day 0: Priority Evaluator assigns "high" priority to "Release 2.0"
Day 0: Deadline Enforcer sets deadline: 2026-08-01

Day 28 (3d warning):
  Deadline Enforcer: "⚠️ Release 2.0 deadline in 3 days"
  Agent: "Acknowledged, will prioritize"

Day 30 (1d warning):
  Deadline Enforcer: "🚨 Release 2.0 deadline TOMORROW"
  Agent: "Working on it"

Day 31 (deadline passed):
  Deadline Enforcer: "❌ Deadline passed. Release 2.0 blocked."
  Agent attempts completion → API blocks with reason
  Escalation: "Project owner notified"

Day 32 (grace period expired):
  Deadline Enforcer: "Archiving Release 2.0. Auto-move to next sprint."
  Agent: Cannot access or modify archived goal
```

### Scenario 2: Priority Enforcement

```
Agent: "I want to work on 'Redesign landing page' first"
Priority Evaluator: analyzes...
  - Business impact: low (not a revenue driver)
  - Dependencies: 0 (no goals depend on it)
  - Effort: high (2 weeks)
  - External: none

Result: "Priority assigned: LOW. You should work on 'Fix payment gateway' (HIGH) first."

Agent: "But I prefer to redesign first"
System: ❌ Blocked. Priority constraints cannot be overridden.

Agent: "OK, I'll work on the payment gateway."
System: ✅ Goal status updated to 'in_progress'
```

### Scenario 3: Dependency Chain

```
Dependency Chain:
  goal_A (auth) → goal_B (payments) → goal_C (checkout)

Agent tries to work on goal_C (checkout) first
Dependency Watcher: ❌ Blocked
  "goal_C depends on goal_B, which is not started."

Agent tries to work on goal_B (payments)
Dependency Watcher: ❌ Blocked
  "goal_B depends on goal_A, which is not completed."

Agent: "OK, I'll finish goal_A first."
System: ✅ goal_A started
Dependency Watcher: "goal_B unblocked. goal_C still blocked."

When goal_A completes:
Dependency Watcher: "✅ goal_B unblocked. Recommended: Start goal_B"
```

---

## API Reference (Extended)

### Plugin Management

```http
GET /plugins
# List all active plugins

POST /plugins/:pluginId/constraints
# Plugin imposes constraint on goal/project

GET /plugins/:pluginId/status
# Get plugin health and enforcement status

PUT /plugins/:pluginId/configuration
# Update plugin configuration
```

### Enforcement

```http
GET /enforcement/checks
# Get all constraint check results

GET /enforcement/audit
# Get audit log of enforcement actions

POST /enforcement/override
# Request override (requires approval)
```

### Agent Interface

```http
GET /agent/tasks
# Get assigned goals

POST /agent/report
# Report progress

POST /agent/blocked
# Report being blocked

POST /agent/request-override
# Request constraint override
```

---

## Configuration

### .env.extended

```env
# Enforcement Configuration
ENFORCEMENT_LEVEL=strict         # strict | moderate | permissive
AUTO_ESCALATE=true
AUDIT_LOG=true

# Plugin Configuration
PLUGIN_DEADLINE_INTERVAL=24h
PLUGIN_DEADLINE_GRACE=24h
PLUGIN_DEADLINE_WARNING=3d
PLUGIN_DEADLINE_CRITICAL=1d

# Agent Interface
AGENT_AUTO_ACKNOWLEDGE=false
AGENT_MAX_BLOCKED_TIME=7d
AGENT_ESCALATION_CONTACT=project_owner
```

---

## Comparison: Basic vs Advanced

| Aspect | Basic Planner | Advanced Planner |
|--------|---------------|------------------|
| Constraint creator | Agent | Plugins (autonomous) |
| Enforcement method | Self-report | System-enforced |
| Override ability | Yes | No (requires escalation) |
| Audit trail | Optional | Mandatory |
| Escalation | None | Automatic |
| Agent role | Planner | Executor |
| Key plugin | None | Deadline Enforcer, Priority Evaluator, Dependency Watcher |

---

## Development Roadmap

### Phase 1: Core Enforcement (Current)
- [ ] Deadline Enforcer plugin
- [ ] Priority Evaluator plugin
- [ ] Dependency Watcher plugin
- [ ] API gateway for enforcement
- [ ] Audit logging

### Phase 2: Extended Plugins
- [ ] Approval Guardian plugin
- [ ] Resource Monitor plugin
- [ ] Automated Reallocator
- [ ] Predictive Deadline Estimator

### Phase 3: Multi-Agent Coordination
- [ ] Multiple agent support
- [ ] Task assignment optimization
- [ ] Conflict resolution
- [ ] Load balancing

---

## Agent Prompt Template

For agents using this system, include this in their system prompt:

```markdown
You are operating under the Planner Advanced external constraint system.

**Your role**: You are an executor, not a planner.
**Your responsibility**: Complete assigned goals within constraints.
**You cannot**: Override deadlines, priorities, or dependencies.

**Before any action**:
1. Check if the goal is blocked
2. Verify deadline is not passed
3. Confirm priority order

**If blocked**:
1. Report to the system immediately
2. Request unblock or override
3. Work on next highest priority unblocked goal

**Constraint violations**:
- Are automatically detected by the system
- Will trigger alerts and escalations
- Are logged in the audit trail
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deadline hit rate | > 90% | Goals completed by deadline |
| Priority adherence | > 85% | Goals worked in priority order |
| Dependency resolution | < 2d average | Time to resolve blocks |
| Override requests | < 5% of goals | Escalation frequency |
| Self-assigned tasks | 0% | Agent cannot self-assign |

---

## License

MIT
