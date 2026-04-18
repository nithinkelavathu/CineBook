# API Architecture & Integration Guide (B2B / B2C)

This document provides a clear categorization of our APIs and integrations for project evaluation. Our system follows a professional **Hybrid Architecture** that exposes internal services while consuming external business APIs.

## 1. Categorization Table

| Category | Type | Purpose | Key Endpoints / Services |
| :--- | :--- | :--- | :--- |
| **B2C (Exposed)** | REST API | Services for individual moviegoers | `/api/auth`, `/api/movies`, `/api/bookings` |
| **B2B (Exposed)** | REST API | Services for theatre partners / management | `/api/admin` (Movie & Schedule Management) |
| **B2B (Consumed)** | External API | Third-party business integrations | Stripe (Payments), Gmail SMTP (Transactional Emails) |

---

## 2. API Definitions

### A. B2C (Business-to-Consumer) - Exposed
These APIs are designed for the **End User**. They are optimized for speed using **Redis Caching** and provide a seamless "Search-as-you-grow" experience via MongoDB Text Indexing.
*   **Discovery**: `GET /api/movies` (Optimized with high-performance caching).
*   **Transaction**: `POST /api/bookings` (Secure seat reservation).
*   **Identity**: `POST /api/auth/signup` (Secure user onboarding).

### B. B2B (Business-to-Business) - Exposed
These APIs are designed for **Theater Management Partners**. They allow a theatre business to manage their digital presence on our platform.
*   **Management**: `POST /api/admin/movies` (Enables businesses to upload their own schedules).
*   **Analytics**: `GET /api/admin/dashboard` (Provides business intelligence and booking counts to theatre owners).

### C. B2B (Business-to-Business) - Consumed
Our system acts as a client to other enterprise-grade business APIs to handle complex requirements:
*   **Stripe API**: Consumed for PCI-compliant payment lifecycle management.
*   **SendGrid / Gmail API**: Consumed via Nodemailer for delivering B2B transactional confirmation emails.

---

## 3. Documentation Standards (REST)
Our APIs are strictly documented using the **OpenAPI 3.0 (Swagger)** standard. This ensures that any business partner (B2B) or frontend developer (B2C) can immediately understand and consume our services.

> [!TIP]
> **View the Live Documentation**:
> 1. Start the backend.
> 2. Navigate to: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Standard Features Implemented:
- **Semantic Versioning**: All endpoints follow the `/api/` prefix pattern.
- **JWT Bearer Security**: Professional-grade token-based authentication.
- **Status Code Mapping**:
    - `200/201`: Success
    - `400/401`: Client Errors (Validation/Auth)
    - `500`: Server Integrity
