AI Life Admin – Smart Financial Assistant
An AI-powered mobile app built with React Native and Flask, designed to help users track expenses, earnings, and financial goals through receipt and payslip scanning, budget analysis, and natural language queries.
### 🎥 Demo

Click the image below to watch a full walkthrough of the app:

[![Watch the demo](https://img.youtube.com/vi/sgCwrGNKQSc/0.jpg)](https://www.youtube.com/watch?v=sgCwrGNKQSc)


🚀 Features
📸 OCR-based receipt and payslip scanning (Mindee API)

💵 Income and expense tracking with monthly filtering

📊 Visual reports (bar/pie charts) for spending and income

🎯 Set monthly spending goals with alerts

🧠 AI Budget Optimizer using GPT and 50/30/20 rule

💬 AI Chatbot for financial Q&A (text + voice input)

🎨 Dynamic theming (light/dark mode, custom colors)

🔒 Local storage using SQLite (no cloud database)

🛠 Tech Stack
Frontend: React Native, Expo, TypeScript

Backend: Python, Flask, SQLite

AI/OCR APIs: OpenAI GPT-3.5, Mindee OCR API

Charts: react-native-svg-charts

Other Libraries: Axios, AsyncStorage, react-native-view-shot, etc.


📦 Installation
1. Clone the repository
bash
Copy
Edit
git clone https://github.com/yourusername/ai-life-admin.git
cd ai-life-admin
2. Install frontend dependencies
bash
Copy
Edit
cd frontend
npm install
npm start
3. Run backend server
bash
Copy
Edit
cd ../backend
python app.py
🔑 Environment Variables
Create a .env file in the backend/ folder:

env
Copy
Edit
OPENAI_API_KEY=your_openai_key
MINDEE_API_KEY=your_mindee_key
📱 Running on Device
Use Expo Go to scan the QR code and run the frontend on your phone.

Ensure Flask backend is accessible from mobile (e.g., using ngrok or local IP).

🧪 Testing
Optional: Include manual or automated test instructions here.

🧠 AI Budgeting Logic
Uses the 50/30/20 rule:

50% Needs

30% Wants

20% Savings

Compares user data to ideal ratios

GPT suggests budgeting improvements based on spending patterns

🤖 Voice Chatbot
Built with Expo's speech-to-text + Flask backend

User asks natural language financial questions

GPT responds using local financial data from SQLite

📌 TODO / Future Features
🔔 Push notifications for bill due dates & goals

📅 Calendar view for upcoming payments

📁 Document storage & AI summaries

🌍 Localization support

✍️ Author
Ton Nguyen
LinkedIn • Portfolio • Email

📄 License
MIT License – feel free to fork and build upon this project!

Let me know if you want a copy of this in markdown or tailored to a different type of project.
