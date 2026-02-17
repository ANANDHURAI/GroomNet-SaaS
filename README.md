# 💇‍♀️ GroomNet - SaaS Booking Platform for Beauty Services

> A comprehensive 3-portal ecosystem (Admin, Beauticion, Customer) solving scheduling conflicts with real-time booking orchestration.

<img width="1884" height="909" alt="Screenshot 2026-02-17 125446" src="https://github.com/user-attachments/assets/f308cd92-ef52-4097-971c-2e5070b2873b" />


![React](https://img.shields.io/badge/react-18-blue.svg)
![Django Rest Framework](https://img.shields.io/badge/DRF-API-red.svg)
![Docker](https://img.shields.io/badge/Docker-Container-blue.svg)
![Stripe](https://img.shields.io/badge/Payments-Stripe-purple.svg)

## 📌 Project Overview
GroomNet is a **B2B2C SaaS platform** that connects beauty professionals with clients. Unlike standard booking apps, it handles **dual-booking types** (Instant vs. Scheduled) and manages complex financial flows including Beauticion payouts and commission logic.

## 🌟 Technical Highlights

### 🏗️ Architecture
* **Decoupled Monolith:** React.js Frontend consumes a robust Django REST Framework (DRF) Backend.
* **Concurrency Handling:** Database transactions ensure no two users can book the same slot simultaneously.
* **Real-Time Sync:** **WebSockets (Django Channels)** push instant notifications to Beauticion when a booking is made.

### 💳 Financial Infrastructure
* **Payment Orchestration:** Integration with **Stripe**
* **Digital Wallet:** Internal ledger system for handling cashback, refunds, and top-ups without external gateway calls.

## 🔐 Security & Auth
* **Google OAuth2:** Seamless social login.
* **JWT Authentication:** Stateless authentication with HttpOnly cookie storage for XSS protection.
* **RBAC:** Custom permission classes to segregate Beauticion and Customer APIs.

## 🛠️ Tech Stack

| Layer | Technology/Tools |
| :--- | :--- |
| **Backend** | Python, Django, DRF |
| **Frontend** | React.js, Redux Toolkit |
| **Real-time** | WebSockets (Django Channels) |
| **DevOps** | AWS, Docker, Nginx |

## 🔧 Installation & Setup

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/ANANDHURAI/GroomNet-SaaS.git](https://github.com/ANANDHURAI/GroomNet-SaaS.git)
    cd GroomNet-SaaS
    ```

2.  **Manual Setup (.env)**
    *Create a `.env` file in the backend directory:*
    ```env
    # Django Settings
    SECRET_KEY=your_secret_key
    DEBUG=True
    ALLOWED_HOSTS=127.0.0.1,localhost

    # Database
    POSTGRES_DB=groomnet_db
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=password

    # Payments
    STRIPE_SECRET_KEY=sk_test_...
    RAZORPAY_KEY_ID=rzp_test_...

    # Social Auth
    GOOGLE_OAUTH2_KEY=...
    GOOGLE_OAUTH2_SECRET=...
    ```

3.  **Run with Docker (Recommended)**
    ```bash
    docker-compose up --build
    ```

## 👤 Author
**Anand Kumar** - *Independent Full Stack Developer*
