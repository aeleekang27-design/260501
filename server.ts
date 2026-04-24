import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import cookieParser from "cookie-parser";
import cors from "cors";
import admin from "firebase-admin";

// Initialize Firebase Admin
// In Cloud Run environment, this will use Application Default Credentials
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // Naver OAuth Config
  const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
  
  // Kakao OAuth Config
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  const getRedirectUri = (req: express.Request, provider: string) => {
    // Priority: 1. Manually set APP_URL, 2. Dynamic origin from request headers, 3. Default dev URL
    let appUrl = process.env.APP_URL;
    
    if (!appUrl) {
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host;
      if (host) {
        appUrl = `${protocol}://${host}`;
      } else {
        appUrl = `https://ais-dev-rfibg5s63xuczr4at4xm7o-412002998607.asia-northeast1.run.app`;
      }
    }
    
    if (appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1);
    }
    return `${appUrl}/api/auth/callback/${provider}`;
  };

  // Helper endpoint for the user to see what to copy-paste to Naver
  app.get("/api/auth/config-check", (req, res) => {
    res.json({
      naver: {
        callbackUrl: getRedirectUri(req, "naver"),
        clientIdStatus: !!NAVER_CLIENT_ID ? "Configured" : "Missing"
      },
      kakao: {
        callbackUrl: getRedirectUri(req, "kakao"),
        clientIdStatus: !!KAKAO_CLIENT_ID ? "Configured" : "Missing"
      }
    });
  });

  // Naver Auth URL
  app.get("/api/auth/naver/url", (req, res) => {
    if (!NAVER_CLIENT_ID) {
      console.error("NAVER_CLIENT_ID is missing in environment variables.");
      return res.status(500).json({ error: "Naver Client ID is not configured." });
    }
    const state = Math.random().toString(36).substring(7);
    const redirectUri = encodeURIComponent(getRedirectUri(req, "naver"));
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
    res.json({ url });
  });

  // Kakao Auth URL
  app.get("/api/auth/kakao/url", (req, res) => {
    if (!KAKAO_CLIENT_ID) {
      console.error("KAKAO_CLIENT_ID is missing in environment variables.");
      return res.status(500).json({ error: "Kakao Client ID is not configured." });
    }
    const redirectUri = encodeURIComponent(getRedirectUri(req, "kakao"));
    const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}`;
    res.json({ url });
  });

  // Naver Callback
  app.get("/api/auth/callback/naver", async (req, res) => {
    const { code, state } = req.query;
    try {
      const tokenRes = await axios.get("https://nid.naver.com/oauth2.0/token", {
        params: {
          grant_type: "authorization_code",
          client_id: NAVER_CLIENT_ID,
          client_secret: NAVER_CLIENT_SECRET,
          code,
          state,
        },
      });

      const accessToken = tokenRes.data.access_token;
      const userRes = await axios.get("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = userRes.data.response;
      // profile.id, profile.email, profile.nickname, profile.profile_image
      
      const uid = `naver:${profile.id}`;
      const firebaseToken = await auth.createCustomToken(uid, {
        provider: "naver",
        email: profile.email,
        email_verified: true,
        displayName: profile.nickname,
        photoURL: profile.profile_image,
      });

      res.send(generatePopupScript(firebaseToken));
    } catch (error) {
      console.error("Naver Auth Error:", error);
      res.status(500).send("Naver Authentication Failed");
    }
  });

  // Kakao Callback
  app.get("/api/auth/callback/kakao", async (req, res) => {
    const { code } = req.query;
    try {
      const tokenRes = await axios.post("https://kauth.kakao.com/oauth/token", null, {
        params: {
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID,
          client_secret: KAKAO_CLIENT_SECRET,
          redirect_uri: getRedirectUri(req, "kakao"),
          code,
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const accessToken = tokenRes.data.access_token;
      const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = userRes.data;
      const uid = `kakao:${profile.id}`;
      const firebaseToken = await auth.createCustomToken(uid, {
          provider: "kakao",
          email: profile.kakao_account?.email,
          email_verified: true,
          displayName: profile.properties?.nickname,
          photoURL: profile.properties?.profile_image,
      });

      res.send(generatePopupScript(firebaseToken));
    } catch (error) {
      console.error("Kakao Auth Error:", error);
      res.status(500).send("Kakao Authentication Failed");
    }
  });

  function generatePopupScript(token: string) {
    return `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${token}' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>인증 성공! 창이 자동으로 닫힙니다.</p>
        </body>
      </html>
    `;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
