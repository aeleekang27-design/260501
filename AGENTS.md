# Project Setup Instructions

This project requires manual configuration of external authentication providers.

## 1. Naver & Kakao Login (Custom Authentication)
- **Status**: Custom Token based (Node.js backend)
- **Required Secrets**:
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
- **Required Redirect URIs**:
  - Naver: `<APP_URL>/api/auth/callback/naver`
  - Kakao: `<APP_URL>/api/auth/callback/kakao`

## 2. Apple & Google Login (Firebase Native)
- **Status**: Handled by Firebase Auth SDK
- **Required Actions**:
  - Go to [Firebase Console](https://console.firebase.google.com/)
  - Select your project
  - Navigate to **Authentication > Sign-in method**
  - Click **Add new provider** and enable **Apple** and **Google**.
  - For Apple, you will need to provide Apple Developer credentials (App ID, Team ID, etc.).

## 3. Environment Variables
- `APP_URL`: Automatically set by the platform, but can be overridden if needed.
- `GEMINI_API_KEY`: Automatically set by the platform.
