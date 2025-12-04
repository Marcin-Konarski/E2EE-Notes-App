# Encrypted Notes Web Application (E2EE)

A full-stack web application for creating, storing, and securely sharing notes. Application features End-To-End Encryption. All encryption is performed on the client side, ensuring the server cannot read note contents even if compromised. App was built as my engineering thesis.

Application is available under:
https://mk0x.com

## Purpose

The project aims to:
- provide a secure notes platform with true end-to-end encryption,
- enable safe sharing of encrypted notes between users,
- deliver a production-ready, containerized deployment.

## Features

- End-to-end encryption performed entirely in the browser  
- Encrypted note sharing for multiple users  on per note basis
- User registration, login, and email verification  
- Personal settings: change email, username, password, theme  
- Rich text editor with autosave  
- Separation between owned and shared notes  
- Asynchronous email sending  for user verification purposes

## Technologies

### Frontend
- React, Vite, Tailwind  
- Tiptap editor  
- Axios with JWT interceptors  
- React Router, React Hook Form, Zod  

### Backend
- Django, Django REST Framework  
- JWT authentication (access + refresh tokens)  
- Celery + Redis for background tasks  
- PostgreSQL database  

### Infrastructure
- Docker and docker-compose  
- Nginx reverse proxy  
- Certbot for SSL certificates  
- Cloudflare for DNS  
- Multi-container architecture (frontend, backend, db, redis, celery, certbot)

## Data Model (Overview)

- **User** – account information  
- **UserKey** – public key and encrypted private key  
- **Note** – metadata and encrypted content  
- **NoteItem** – encrypted symmetric key per user per note  

This structure enables multi-user access without exposing data to the server.

## Architecture

Application is fully deployed and production-ready on DigitalOcean's VPS

![Architecture Diagram](./app-architecture-4.png)

The application uses a container-based structure with two networks:
- **internal**: Postgres, Redis, Celery, Backend  
- **web**: Frontend, Backend, Certbot  

Nginx serves the frontend and proxies API requests to the backend.

## Production Deployment (Summary)

1. Set environment variables in `.env`.  
2. Build and run the system:
    ```bash
    docker-compose -f docker-compose.prod.yaml up --build
    ```
3. Run the SSL initialization script for the first certificate generation.

## Project Status

The system is fully implemented and deployed. For deployment ready setup go to `hosting` branch. Future improvements may include refining the database structure improving user interface, extending the application’s feature set and possibly completely moving into AWS infrastructure.


___


Built with ❤️ by Marcin Konarski
