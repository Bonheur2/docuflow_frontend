# DocuFlow

DocuFlow is a secure, end-to-end document workflow system. It enables authenticated users to upload, manage, review, and approve documents through a web interface, with real-time notifications and robust backend support.

## 🔑 Features

- **User Authentication & Authorization**: Secure LDAP-based login system.
- **Document Storage**: Documents stored in MongoDB; metadata in PostgreSQL.
- **Workflow Management**: Documents go through states (Draft → Submitted → Under Review → Approved/Rejected).
- **Real-Time Notifications**: Apache Pulsar-driven event system for notifications and audit logs.
- **Modern UI**: Built with ReactJS for a responsive, intuitive experience.
- **RESTful Backend**: Developed using Spring Boot 3 and Java 17.

---

## 🧱 Architecture Overview

### Frontend (ReactJS)
- Login, upload, dashboard, and document detail views.
- Communicates with backend REST API.
- Optional: WebSocket or polling-based real-time notifications.

### Backend (Spring Boot 3, Java 17)
- LDAP authentication with Spring Security.
- PostgreSQL for document metadata.
- MongoDB for unstructured document storage.
- Apache Pulsar for messaging and workflow events.
- Exposes REST endpoints for all core operations.

### Messaging System
- **Apache Pulsar** is used to publish and consume document workflow events for real-time notification and logging.

---

## 📁 Project Structure

docuflow_frontend/
├── public/
├── src/
│ ├── assets/
│ ├── components/
│ ├── App.jsx
│ ├── main.jsx
│ └── ...
├── .gitignore
├── package.json
├── vite.config.js
└── README.md


---

## 🚀 Getting Started

### Backend Setup
1. Clone the backend repository.
2. Use [Spring Initializr](https://start.spring.io/) to generate a Spring Boot 3 project.
3. Add dependencies:
   - Spring Web, Spring Security, Spring Data JPA, Spring Data MongoDB, Apache Pulsar Client.
4. Configure:
   - `application.yml` for LDAP, PostgreSQL, MongoDB, and Pulsar.
5. Run your backend application.

### Frontend Setup
```bash
# Clone this repository
git clone https://github.com/Bonheur2/docuflow_frontend.git
cd docuflow_frontend

# Install dependencies
npm install

# Run the app
npm run dev

🛡️ Authentication
LDAP is used for secure login. Users are assigned roles (e.g., Submitter, Reviewer, Approver) based on their LDAP groups.

📨 Workflow & Notifications
On any state change (submit, approve, reject), events are published to an Apache Pulsar topic. These can be consumed to trigger:

Email notifications

Dashboard alerts

Audit logs

📌 Roadmap
 Add role-based UI restrictions

 Improve document search functionality

 Implement real-time notifications via WebSockets

 Add unit/integration tests

🤝 Contributing
Contributions are welcome! Please fork the repo and open a pull request.

📄 License
MIT

👨‍💻 Author
Bonheur2 

