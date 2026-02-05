# Software Requirements Specification: PowerLit

## 1. Project Overview
**PowerLit** is a specialized AI-powered analytical platform tailored for electrical companies in **Accra, Ghana**. The application automates the conversion of electrical blueprints and legends into precise technical load profiles and energy recommendations, reducing manual calculation errors and operational costs.

---

## 2. Problem Statement
* **The Pain:** Electrical firms currently spend significant hours manually calculating loads from physical or digital drawings.
* **The Risk:** Manual analysis is prone to human error, leading to under-sized equipment or safety violations.
* **The Impact:** Increased project costs, delayed timelines, and potential technical failures.

---

## 3. Core Functional Requirements

### 3.1 Multimodal AI Input (Gemini Integration)
* **Document Upload:** Support for `.pdf`, `.png`, and `.jpg` files (Blueprints, Circuit Diagrams, and Legend keys).
* **Image Recognition:** The AI must identify electrical symbols from the legend and map their frequency and location on the plan.
* **Contextual Logic:** Recognition of building type (Residential vs. Industrial) to apply appropriate diversity factors.

### 3.2 "Step-by-Step" Analytical Engine
To prevent technical hallucinations, the system must force a **Chain of Thought (CoT)** reasoning process:
1.  **Load Identification:** List all identified components (e.g., HVAC units, socket outlets, lighting).
2.  **Calculation:** Perform calculations for:
    * **Total Connected Load ($TCL$):** $$TCL = \sum (Rating_{unit} \times Quantity)$$
    * **Maximum Demand ($MD$):** $$MD = TCL \times DiversityFactor$$
3.  **Redundancy Planning:** Determine $N+1$ or $N+2$ requirements for critical systems.
4.  **Compliance Audit:** Cross-reference calculations with **Ghana Energy Commission (GS1009)** standards.

### 3.3 Recommendation & Output
* **Power Sourcing:** Suggest the optimal mix of Grid (ECG), Solar PV, Battery Storage (ESS), or Backup Generators.
* **Export Formats:** Generate technical reports in **PDF** or high-resolution **Image** formats including the logic-tree used for calculations.

---

## 4. Technical Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite) |
| **Styling** | Tailwind CSS |
| **AI Model** | Google Gemini 1.5 Pro (via API) |
| **State Management** | React Context API / Zustand |
| **PDF Generation** | @react-pdf/renderer or Puppeteer |
| **Deployment** | Vercel (Production-ready tonight) |

---

## 5. Design & UI Specifications
Based on the **PowerLit** branding provided:

* **Primary Color:** `#007A41` (Deep Forest Green) - Backgrounds, Navigation.
* **Accent Color:** `#FFC132` (Sunlight Yellow) - CTAs like "Get Assessment".
* **Secondary Text:** White (`#FFFFFF`) and Light Gray for readability.
* **Interface Goal:** Clean, technical, and high-contrast.

> **Note:** The UI must be optimized for "Workplace" mode—a split-screen view where the user can see their uploaded plan on the left and the AI's live calculation reasoning on the right.

---

## 6. Project Roadmap (Deployment Focus)
1.  **Phase 1:** UI Scaffold using Tailwind and the provided color palette.
2.  **Phase 2:** Integration of File Upload and Gemini Vision API.
3.  **Phase 3:** Implementation of the "Thinking Terminal" (showing CoT steps).
4.  **Phase 4:** PDF Export functionality and deployment.

---