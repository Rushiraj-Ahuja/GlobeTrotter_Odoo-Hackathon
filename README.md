<div align="center">
  <h1>🌍 GlobeTrotter</h1>
  <p><b>Plan less. Experience more. Build your journey, your way.</b></p>
</div


## A personalized travel-planning web application for creating, organizing, budgeting, visualizing, and sharing multi-city trips.

## Project Overview

GlobeTrotter brings cities, dates, activities, itineraries, budgets, and sharing into one personalized travel-planning workspace.

## Problem Statement

Planning a multi-city trip across search engines, maps, spreadsheets, calendars, and messages makes it difficult to organize destinations, create a realistic schedule, track costs, and share a clear plan.

## Solution

GlobeTrotter unifies that workflow so users can select cities, discover activities, assign plans to dates, estimate costs, review the journey visually, and share the itinerary.

## Key Features

| Area | Features |
| --- | --- |
| Account | Login/Signup, profile, and settings |
| Planning | Dashboard, Create Trip, and My Trips |
| Discovery | City Search and Activity Search |
| Itinerary | Day-wise Itinerary Builder and Itinerary View |
| Budget | Trip Budget and Cost Breakdown |
| Timeline | Calendar and trip timeline |
| Sharing | Public Shareable Itinerary |

## User Flow

```text
Login -> Dashboard -> Create Trip -> Add Cities -> Add Activities
	-> Set Dates and Budget -> Build Itinerary -> Review Trip
	-> Share Itinerary
```

## Technology Stack

React.js, JavaScript, HTML, CSS, Tailwind CSS, and a relational database. The `integration/` directory is reserved for project integrations.

## Database Overview

Planned entities include Users, Trips, Cities, Activities, Itinerary Items, Budgets, and Shares.

## Project Folder Structure

```text
GlobeTrotter_Odoo-Hackathon/
├── integration/      # Integrations
├── src/               # Application source
│   ├── components/    # Reusable UI
│   ├── pages/         # Application screens
│   └── services/      # APIs and integrations
└── README.md
```

## Installation and Setup

```bash
git clone <repository-url>
cd GlobeTrotter_Odoo-Hackathon
npm install
```

Configure the database and backend environment variables in a local `.env` file.

## How to Run the Project

```bash
npm run dev
```

## How to Use the Application

1. Log in and create a trip from the dashboard.
2. Add cities, activities, dates, and a budget.
3. Build, review, and share the itinerary.

## Future Enhancements

- Live maps, route optimization, and travel recommendations.
- Currency conversion, collaboration, and offline/mobile access.
- AI-assisted itineraries and admin analytics.

## Hackathon Highlights

- Solves a common travel-planning problem.
- Combines discovery, scheduling, budgeting, and sharing.
- Provides a practical workflow for a focused demo.

## Team Members

| Name | Area |
| --- | --- |
| Rushiraj Ahuja | Frontend |
| Nirav lavariya | Backend |
| Nilesh Parmar | Database |
| Makvana Dharmesh | Integration |
