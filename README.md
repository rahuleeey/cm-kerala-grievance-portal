# Chief Minister's Public Grievance Redressal Portal (Kerala)

An AI-assisted full-stack public grievance management system built for the Government of Kerala Chief Minister's Office (CMO), enabling citizens to lodge complaints, receive automated AI department classification and priority triage, and track real-time departmental resolution.

## Tech Stack
- **Frontend & Backend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Database & ORM:** PostgreSQL (Neon) with Prisma ORM
- **AI Triage Engine:** Groq SDK (`llama-3.3-70b-versatile`) with heuristic fallback
- **Authentication:** Custom JWT HTTP-Only Cookie Authentication (`bcryptjs` + `jsonwebtoken`)

## Demo Login Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | `citizen@kerala.gov.in` | `Password@123` |
| **CMO Administrator** | `cmo@kerala.gov.in` | `Password@123` |
| **Department Officer (PWD)** | `pwd.officer@kerala.gov.in` | `Password@123` |

- **Pre-seeded Public Tracking ID:** `KL-2026-PWD-001`

## Local Setup Instructions
1. Install dependencies:
   ```bash
   npm install