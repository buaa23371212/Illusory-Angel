# Constraint Examples

## Common Constraint Types

### Deadline
```json
{
  "type": "deadline",
  "parameters": {
    "dueDate": "2026-08-01T00:00:00Z",
    "timezone": "UTC"
  }
}
```

### Priority
```json
{
  "type": "priority",
  "parameters": {
    "level": "high"
  }
}
```

### Dependency
```json
{
  "type": "depends_on",
  "parameters": {
    "goalId": "goal_456"
  }
}
```

### Recurrence
```json
{
  "type": "recurrence",
  "parameters": {
    "pattern": "daily",
    "until": "2026-12-31T00:00:00Z"
  }
}
```

### Effort Limit
```json
{
  "type": "max_effort",
  "parameters": {
    "hours": 5
  }
}
```
