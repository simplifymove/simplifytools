# Google Cloud Vision Setup Guide

## Overview
PDF OCR feature uses **Google Cloud Vision API** for enterprise-grade text extraction with 95%+ accuracy.

## Setup Steps

### 1. Create Google Cloud Project
```bash
# Visit Google Cloud Console
https://console.cloud.google.com

# Create a new project:
- Click "Select a Project"
- Click "NEW PROJECT"
- Name: "TinyTools OCR"
- Click "CREATE"
```

### 2. Enable Vision API
```bash
# In Google Cloud Console:
- Go to "APIs & Services" > "Library"
- Search for "Cloud Vision API"
- Click on it
- Click "ENABLE"
```

### 3. Create Service Account
```bash
# In Google Cloud Console:
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "Service Account"
- Service Account Name: "tinytools-ocr"
- Click "CREATE AND CONTINUE"
- Grant role: "Basic" > "Editor"
- Click "CONTINUE" > "DONE"
```

### 4. Create and Download Key
```bash
# In Google Cloud Console:
- Go to "APIs & Services" > "Credentials"
- Under "Service Accounts", click on the created account
- Go to "Keys" tab
- Click "Add Key" > "Create new key"
- Select "JSON"
- Click "CREATE"
- Save the downloaded JSON file securely
```

### 5. Environment Variables Setup

#### Option A: Using Service Account File Path
Create `.env.local` in project root:
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### Option B: Using Credentials JSON (Recommended for Docker/Cloud Deployment)
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Get credentials JSON from your downloaded key file.

### 6. Install Dependencies
```bash
npm install @google-cloud/vision docx
```

### 7. Test the Setup
```bash
# Start dev server
npm run dev

# Upload a PDF at:
http://localhost:3000/all-tools/pdf/ocr-to-text
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT_ID` | GCP Project ID | `my-project-123` |
| `GOOGLE_CLOUD_CREDENTIALS` | Service account JSON (encoded or direct) | JSON object |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key file | `/path/to/key.json` |

## Pricing

**Google Cloud Vision API Pricing:**
- $1.50 per 1,000 Document Text Detection requests (first 1,000/month free)
- Regional availability in US, EU, Asia regions

**Example Costs:**
- 100 PDFs/month: ~$0.15
- 10,000 PDFs/month: ~$15
- 100,000 PDFs/month: ~$150

## Troubleshooting

### "Cannot find module '@google-cloud/vision'"
```bash
npm install @google-cloud/vision
```

### "Credentials not found"
- Verify `GOOGLE_CLOUD_CREDENTIALS` or `GOOGLE_APPLICATION_CREDENTIALS` is set
- Check project ID matches GCP console
- Ensure service account has Vision API access

### "403 Forbidden"
- Verify API is enabled in "APIs & Services" > "Library"
- Check service account has Editor role
- Wait a few minutes after enabling API

### "Rate limit exceeded"
- Upgrade GCP billing plan
- Implement request queuing in production

## Security Best Practices

1. ✅ Never commit credentials to Git
2. ✅ Use `.env.local` for local development (add to `.gitignore`)
3. ✅ Use GCP Secret Manager for production
4. ✅ Limit service account permissions to Vision API only
5. ✅ Rotate keys regularly
6. ✅ Monitor API usage in GCP console

## Deployment

### Vercel
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add:
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_CREDENTIALS`
3. Deploy normally

### Docker/Self-Hosted
1. Mount credentials file or set via env vars
2. Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to correct location
3. Start container with mounted volume

## API Usage

### Frontend Upload
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/pdf/ocr', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
// result.data contains:
// - fullText: extracted text
// - textBlocks: positioned text blocks
// - confidence: accuracy percentage
// - pages: number of pages processed
```

### Response Format
```json
{
  "success": true,
  "data": {
    "fullText": "Extracted text from PDF...",
    "textBlocks": [
      {
        "text": "Document",
        "confidence": 0.98,
        "bounds": { "x": 100, "y": 50, "width": 200, "height": 30 },
        "font": { "name": "Calibri", "size": 14, "bold": false },
        "color": { "r": 0, "g": 0, "b": 0 }
      }
    ],
    "confidence": 95,
    "pages": 3,
    "fileName": "document.pdf"
  }
}
```

## Additional Resources

- [Google Cloud Vision Documentation](https://cloud.google.com/vision/docs)
- [Node.js Client Library](https://github.com/googleapis/nodejs-vision)
- [Service Accounts Guide](https://cloud.google.com/docs/authentication/getting-started)

## Support

For issues:
1. Check [Google Cloud Status](https://status.cloud.google.com/)
2. Review [Vision API Documentation](https://cloud.google.com/vision/docs)
3. Check API quota in "APIs & Services" > "Quotas"
