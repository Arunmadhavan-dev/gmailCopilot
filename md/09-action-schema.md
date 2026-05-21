# Action Schema

## Base Schema

{
  "action": "string",
  "query": "string",
  "requiresConfirmation": true,
  "reason": "string"
}

---

## Supported Actions

### Search Emails

{
  "action": "search_emails",
  "query": "from:linkedin is:unread"
}

### Archive Emails

{
  "action": "archive_emails",
  "query": "category:promotions older_than:30d",
  "requiresConfirmation": true
}


### Delete Emails 

{
  "action": "delete_emails",
  "query": "category:promotions older_than:90d",
  "requiresConfirmation": true
}

### Safety Rules
Rule 1
Never execute delete/archive immediately.
Rule 2
Always preview affected emails.
Rule 3
Never hallucinate actions.
Rule 4
If intent confidence is low:
•	ask clarifying question
•	do not execute  
