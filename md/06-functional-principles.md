# Functional Principles

## Intent Parsing

Natural Language → Structured Action JSON

Example:

Input:
"show unread promotions"

Output:
{
  "action": "search_emails",
  "query": "category:promotions is:unread"
}

---

## Search Layer
- execute Gmail queries
- paginate results
- fetch matching emails

---

## Action Layer
Supported actions:
- archive
- delete
- mark read
