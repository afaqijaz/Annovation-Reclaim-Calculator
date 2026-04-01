import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase limit for PDF base64 data
  app.use(express.json({ limit: '50mb' }));

  // API route to send PDF
  app.post("/api/send-pdf", async (req, res) => {
    const { email, pdfBase64, filename } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ error: "Missing email or PDF data" });
    }

    // Gmail configuration
    // Note: User needs to provide GMAIL_USER and GMAIL_APP_PASSWORD in environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'afaqijazkhan@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER || 'afaqijazkhan@gmail.com',
        to: email,
        subject: 'Your NexCAD ROI Audit Report',
        text: 'Please find your NexCAD ROI Audit Report attached.',
        attachments: [
          {
            filename: filename || 'NexCAD_ROI_Audit.pdf',
            content: pdfBase64,
            encoding: 'base64'
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email. Check GMAIL_APP_PASSWORD configuration." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
