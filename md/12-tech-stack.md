# Inbox Copilot — Tech Stack (First Principles)

## Core Philosophy

Choose technologies that optimize for:

- fast iteration
- low debugging friction
- browser-native simplicity
- strong AI tooling
- maintainability
- solo-builder speed
- production reliability

Avoid:
- abstraction-heavy frameworks
- magic tooling
- unnecessary architecture complexity

---

# Frontend Stack

## Extension Framework

### Chrome Extension Manifest V3 (Vanilla)

Use:
- native Chrome Extension APIs
- manual content scripts
- manual background service worker

Do NOT use:
- Plasmo
- abstraction-heavy extension frameworks

Why:
- easier debugging
- full control
- lower mental overhead
- better understanding of browser architecture
- less framework lock-in

---

## UI Framework

### React

Why:
- ecosystem maturity
- component architecture
- fast development
- great AI/codegen support
- huge community

Use React only for:
- floating assistant UI
- overlays
- chat window
- action cards

Keep Gmail integration separate from React.

---

## Styling

### Tailwind CSS

Why:
- rapid UI iteration
- low CSS maintenance
- excellent for AI-generated UI
- minimal context switching

Avoid:
- styled-components
- large CSS architecture systems

---

## State Management

### Zustand

Why:
- minimal boilerplate
- tiny bundle size
- easy debugging
- perfect for floating UI state

State examples:
- assistant open/close
- chat history
- pending actions
- confirmation modals

Avoid:
- Redux
- MobX
- overengineered state systems

---

## Animations

### Framer Motion

Why:
- smooth floating UI transitions
- conversational feel
- production-quality animations

Use only for:
- overlay open/close
- drag interactions
- action transitions

---

# Backend Stack

## Backend Runtime

### Next.js API Routes

Why:
- simplest AI backend setup
- easy deployment
- easy authentication
- minimal ops overhead
- perfect for MVPs

Responsibilities:
- OpenAI API calls
- Gmail token handling
- action validation
- rate limiting

Avoid:
- microservice architecture
- Kubernetes
- server complexity

---

## Hosting

### Vercel

Why:
- frictionless deployment
- instant previews
- easy environment management
- optimized for Next.js

---

# AI Stack

## LLM Provider

### OpenAI API

Model Recommendations:
- GPT-5.5 for orchestration
- GPT-4.1-mini for cheaper parsing
- GPT-4.1 for fallback reliability

Primary use:
- intent parsing
- action generation
- conversational responses

---

## AI Architecture

### Function Calling + Structured Outputs

Use:
Natural Language → Structured JSON Actions

Example:

{
  "action": "archive_emails",
  "query": "category:promotions older_than:30d"
}

Avoid:
- freeform AI execution
- autonomous agents
- uncontrolled tool usage

---

# Gmail Integration

## Gmail API

Use for:
- search
- archive
- delete
- mark read
- thread retrieval

Authentication:
- Google OAuth

Principle:
request minimum possible scopes

---

# Extension Architecture

## Content Script

Responsibilities:
- inject floating UI
- monitor Gmail navigation
- communicate with background worker

---

## Background Service Worker

Responsibilities:
- OAuth flows
- Gmail API communication
- secure token handling
- backend communication

---

## Overlay System

Use:
- Shadow DOM
- React portal
- fixed overlay root

Why:
- prevent Gmail CSS conflicts
- maintain UI isolation

---

# Data Layer

## Local Storage

Use:
- chrome.storage.local

Store:
- UI preferences
- temporary state
- cached actions

Avoid:
- premature databases

---

# Logging & Monitoring

## Error Tracking

### Sentry

Why:
- extension debugging
- production visibility
- runtime monitoring

---

# Development Philosophy

## Prioritize

- simplicity
- debuggability
- fast shipping
- low abstraction
- browser-native understanding

---

# Final Recommended Stack

## Frontend
- React
- Tailwind CSS
- Zustand
- Framer Motion

---

## Extension
- Native Chrome Extension APIs
- Manifest V3
- Content Scripts
- Background Service Worker

---

## Backend
- Next.js API Routes
- Vercel

---

## AI
- OpenAI API
- Function Calling
- Structured Outputs

---

## APIs
- Gmail API
- Google OAuth

---

# Explicitly Avoid

Do NOT use:
- Plasmo
- Redux
- Electron
- Firebase initially
- LangChain initially
- vector databases initially
- autonomous agents initially
- microservices
- overengineered architecture

---

# Core Principle

Build the simplest possible architecture that:
- works reliably
- is easy to debug
- ships fast
- scales later