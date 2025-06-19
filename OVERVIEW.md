# Personal Programming Blog - Project Overview

## Core Concept
A personal programming blog where I document daily development work through markdown files. Users can discover content through semantic search, finding posts based on technologies, concepts, or problem-solving approaches I've written about.

## Content Structure

### Blog Posts
- **Format**: Daily markdown files containing unstructured lists of development work
- **Naming**: Date-based posts (e.g., `2025-06-18.md`)
- **URL Structure**: Date-based URLs (e.g., `/2025-06-18`)
- **Metadata**: Each post includes:
  - Title
  - Date
  - Tags
- **Content**: Free-form descriptions of features developed, problems solved, technologies used

### Example Post Structure
```markdown
---
title: "Backend API Improvements and React Native Updates"
date: 2025-06-18
tags: ["react-native", "nodejs", "api", "caching"]
---

- Added Redis caching layer to user authentication API
- Fixed React Native navigation bug causing crashes on Android
- Implemented database connection pooling for better performance
- Researched GraphQL federation patterns for microservices
```

## User Interface

### Layout
- **Header**: Website title with prominent search bar underneath
- **Main Content**: Large, date-sorted list of blog entry cards (most recent first)
- **Cards Display**:
  - Post title
  - Date
  - Tags
  - No excerpt/summary needed

### Search Experience
- **Primary Interaction**: Search bar filters the card list in real-time
- **Search Type**: Semantic search using pre-computed embeddings
- **Query Examples**:
  - "React Native" → Shows posts mentioning React Native work
  - "Problem solving" → Shows posts about complex problems solved
  - "API optimization" → Shows posts about API improvements
- **Behavior**: Cards get filtered based on semantic similarity to search query

## Technical Architecture

### Frontend (GitHub Pages SPA)
- **Hosting**: GitHub Pages static site
- **Framework**: To be determined (vanilla JS, React, etc.)
- **Assets**:
  - Static HTML/CSS/JS files
  - Pre-computed embeddings JSON file
  - Markdown post files

### Build Process
- **Trigger**: Local command (`git build` / `git deploy`)
- **Process**:
  1. Read all markdown files from posts directory
  2. Extract content, title, date, tags from each post
  3. Chunk content appropriately for embedding
  4. Generate embeddings using configurable model
  5. Create embeddings index JSON file
  6. Generate static site files
  7. Deploy to GitHub Pages

### Search Implementation
- **Embeddings**: Pre-computed at build time, stored as JSON
- **Model**: Configurable (starting with `bge-base-en-v1.5`)
- **Client-side**: Load embeddings, perform cosine similarity search in browser
- **Matching**: Pure semantic search (keyword matching as future enhancement)

## File Structure
```
/
├── posts/
│   ├── 2025-06-18.md
│   ├── 2025-06-17.md
│   └── ...
├── src/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── build/
│   ├── embeddings.json
│   ├── posts-index.json
│   └── dist/
├── scripts/
│   ├── build.js
│   └── deploy.js
└── config/
    └── embedding-config.json
```

## Features

### Core Features
- [x] Date-based markdown blog posts
- [x] Semantic search with configurable embedding models
- [x] Real-time card filtering based on search
- [x] Tag system for posts
- [x] Responsive design for mobile/desktop
- [x] GitHub Pages deployment

### Search Capabilities
- [x] "Experience with X" queries (e.g., "React Native", "Node.js")
- [x] Concept-based queries (e.g., "Problem solving", "API optimization")
- [x] Technology stack queries (e.g., "Frontend frameworks", "Database work")
- [x] Client-side vector similarity search
- [x] Configurable embedding models for testing

### Build System
- [x] Local build command integration
- [x] Automatic embedding generation
- [x] Configurable embedding model selection
- [x] Static site generation for GitHub Pages
- [x] Version control integration

### Future Enhancements
- [ ] Traditional keyword search toggle
- [ ] Advanced filtering (by date range, tags)
- [ ] Search result highlighting
- [ ] Analytics integration
- [ ] Performance optimizations for large post collections
- [ ] Search query suggestions/autocomplete

## Success Metrics
- Users can quickly find relevant posts about specific technologies
- Search accurately surfaces posts about problem-solving approaches
- Site loads quickly with pre-computed embeddings
- Easy daily workflow for adding new posts
- Embedding model can be swapped for testing different approaches

## Technical Constraints
- Must work as static GitHub Pages site
- No server-side processing (except build time)
- Embedding model must be configurable for testing
- Search must work entirely client-side
- Build process must integrate with git workflow
