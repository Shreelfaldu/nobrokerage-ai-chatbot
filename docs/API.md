# NoBrokerage AI Chatbot - API Documentation

## 📖 Overview

This document provides comprehensive API documentation for the NoBrokerage AI Property Search Chatbot backend service. The API enables natural language property search with intelligent filter extraction and AI-powered summaries.

**Base URL (Development):** `http://localhost:5000`  
**Base URL (Production):** `https://your-deployed-backend-url.com`

---

## 🔌 Endpoints

### 1. Health Check

Check if the backend server is running and healthy.

**Endpoint:** `GET /health`

**Request:**
curl http://localhost:5000/health


**Response:**
{
"status": "Server is running"
}


**Status Codes:**
- `200` - Server is healthy
- `500` - Server error

---

### 2. Chat Query (Main Endpoint)

Send a natural language query to search for properties.

**Endpoint:** `POST /api/chat`

**Headers:**
Content-Type: application/json

**Request Body:**
{
"message": "3BHK flat in Pune under ₹1.2 Cr"
}

**Success Response (200):**
{
"summary": "Found 6 3BHK properties in Pune within your budget of ₹1.2 Cr. Top localities include Ravet and Punawale. Prices range from ₹0.79 Cr to ₹1.18 Cr. 2 are ready-to-move and 4 are under construction.",
"properties": [
{
"id": "cmf5r6hv20005vxpt3yfnl2qp",
"title": "Pristine02",
"city": "Pune",
"locality": "Sai nagar",
"bhk": "2BHK",
"price": "₹12.00 Cr",
"priceValue": 120000000,
"carpetArea": "972 sq ft",
"status": "Ready to Move",
"amenities": ["Balcony", "Parking", "Lift"],
"bathrooms": "2",
"balcony": "3",
"furnishedType": "UNFURNISHED",
"slug": "pristine02-modelcolony-shivajinagar-pune-428955",
"address": "sr no 13 beside godrej, opposite to mca stadium, sai nagar, mamurdi, pune",
"image": "https://pub-d28896f69c604ec5aa743cb0397740d9.r2.dev/1757011238541.jpg"
}
],
"filters": {
"city": "Pune",
"bhk": "3BHK",
"maxBudget": 12000000,
"minBudget": null,
"status": null,
"locality": null,
"projectName": null
},
"totalResults": 6
}

**Error Responses:**

**400 - Bad Request (Missing Message):**
{
"error": "Message is required",
"code": "MISSING_MESSAGE"
}


**400 - Bad Request (Invalid Type):**
{
"error": "Message must be a string",
"code": "INVALID_MESSAGE_TYPE"
}


**400 - Bad Request (Empty Message):**
{
"error": "Message cannot be empty",
"code": "EMPTY_MESSAGE"
}


**400 - Bad Request (Message Too Long):**
{
"error": "Message is too long (max 500 characters)",
"code": "MESSAGE_TOO_LONG"
}

**500 - Internal Server Error:**
{
"error": "Internal server error",
"message": "Detailed error message"
}

---

## 📝 Query Examples

### Example 1: Basic BHK + City + Budget Search
curl -X POST http://localhost:5000/api/chat
-H "Content-Type: application/json"
-d '{"message": "3BHK in Pune under ₹1.2 Cr"}'


**Extracted Filters:**
- City: Pune
- BHK: 3BHK
- Max Budget: ₹1.2 Cr (12,000,000)

---

### Example 2: Status-Based Search
curl -X POST http://localhost:5000/api/chat
-H "Content-Type: application/json"
-d '{"message": "Ready to move 2BHK in Mumbai"}'


**Extracted Filters:**
- City: Mumbai
- BHK: 2BHK
- Status: READY_TO_MOVE

---

### Example 3: Locality-Specific Search
curl -X POST http://localhost:5000/api/chat
-H "Content-Type: application/json"
-d '{"message": "Under construction properties in Chembur under ₹80 lakhs"}'


**Extracted Filters:**
- Locality: Chembur
- Status: UNDER_CONSTRUCTION
- Max Budget: ₹80 L (8,000,000)

---

### Example 4: Project Name Search
curl -X POST http://localhost:5000/api/chat
-H "Content-Type: application/json"
-d '{"message": "Show me Pristine02 properties"}'


**Extracted Filters:**
- Project Name: Pristine02

---

### Example 5: Complex Multi-Filter Query
curl -X POST http://localhost:5000/api/chat
-H "Content-Type: application/json"
-d '{"message": "Ready to move 3BHK in Mumbai Chembur under ₹1.5 Cr"}'


**Extracted Filters:**
- City: Mumbai
- Locality: Chembur
- BHK: 3BHK
- Status: READY_TO_MOVE
- Max Budget: ₹1.5 Cr (15,000,000)

---

## 🎯 Filter Extraction Details

The API automatically extracts the following filters from natural language queries:

| Filter Type | Supported Values | Examples in Query |
|------------|------------------|-------------------|
| **City** | Mumbai, Pune | "in Pune", "Mumbai properties" |
| **BHK** | 1BHK, 2BHK, 3BHK, 4BHK, 4.5BHK | "3BHK flat", "2 BHK apartment" |
| **Max Budget** | Number + Cr/Lakh/L | "under ₹1.2 Cr", "below 80 lakhs" |
| **Min Budget** | Number + Cr/Lakh/L | "above ₹50 lakhs", "minimum 1 Cr" |
| **Status** | READY_TO_MOVE, UNDER_CONSTRUCTION | "ready to move", "under construction" |
| **Locality** | Chembur, Ravet, Kharadi, Wakad, etc. | "in Chembur", "Ravet area" |
| **Project Name** | Any project name | "Pristine02", "Ashwini project" |

---

## 💰 Budget Format Conversion

The API automatically converts Indian currency formats:

| Input Format | Converted Value |
|-------------|-----------------|
| ₹1.2 Cr | 12,000,000 |
| ₹80 lakhs | 8,000,000 |
| ₹50 L | 5,000,000 |
| 1 crore | 10,000,000 |

---

## 🏠 Property Object Structure

Each property in the `properties` array contains:

{
id: string; // Unique property ID
title: string; // Project name
city: string; // City (Mumbai/Pune)
locality: string; // Locality/area name
bhk: string; // BHK type (e.g., "3BHK")
price: string; // Formatted price (e.g., "₹1.20 Cr")
priceValue: number; // Raw price value in rupees
carpetArea: string; // Carpet area (e.g., "972 sq ft")
status: string; // "Ready to Move" or "Under Construction"
amenities: string[]; // List of amenities (max 3)
bathrooms: string; // Number of bathrooms
balcony: string; // Number of balconies
furnishedType: string; // FURNISHED/SEMI_FURNISHED/UNFURNISHED
slug: string; // URL slug for property details
address: string; // Full address
image: string | null; // Property image URL
}


---

## ⚠️ Error Codes

| Error Code | HTTP Status | Description | Solution |
|-----------|-------------|-------------|----------|
| `MISSING_MESSAGE` | 400 | Message field not provided | Include "message" in request body |
| `INVALID_MESSAGE_TYPE` | 400 | Message is not a string | Send message as string type |
| `EMPTY_MESSAGE` | 400 | Message is empty or whitespace | Provide non-empty message |
| `MESSAGE_TOO_LONG` | 400 | Message exceeds 500 characters | Shorten the query message |
| N/A | 500 | Internal server error | Check server logs |

---

## ⏱️ Performance Metrics

| Metric | Value |
|--------|-------|
| Average Response Time (without OpenAI) | 300-800ms |
| Average Response Time (with OpenAI) | 1.5-3 seconds |
| Max Results Returned | 10 properties |
| Request Timeout | 30 seconds |
| Max Message Length | 500 characters |

---

## 🔐 Authentication

Currently, the API does not require authentication. For production deployment, consider adding:

- API Key authentication
- Rate limiting
- CORS configuration
- JWT tokens

---

## 📊 Rate Limiting

**Current Status:** No rate limiting implemented

**Recommended for Production:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## 🚀 Testing with Postman

### Import Collection:

1. Create new request in Postman
2. Method: POST
3. URL: `http://localhost:5000/api/chat`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):

{
"message": "3BHK in Pune under ₹1.2 Cr"
}

6. Send request

---

## 🧪 Sample Test Cases

### Test Case 1: Valid Query
**Input:** `{"message": "3BHK in Pune under ₹1.2 Cr"}`  
**Expected:** 200 status with properties array

### Test Case 2: No Results
**Input:** `{"message": "10BHK in Delhi under ₹1000"}`  
**Expected:** 200 status with empty properties array and graceful message

### Test Case 3: Missing Message
**Input:** `{}`  
**Expected:** 400 status with error code `MISSING_MESSAGE`

### Test Case 4: Empty Message
**Input:** `{"message": "   "}`  
**Expected:** 400 status with error code `EMPTY_MESSAGE`

---

## 🌐 CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (Development)
- Configure production frontend URL in `.env`

---

## 📚 Additional Resources

- **Project Repository:** [GitHub Link]
- **Frontend Documentation:** See `/frontend/README.md`
- **Video Demo:** [Loom Link]
- **Live Demo:** [Deployment Link]

---

## 💡 Tips for Best Results

1. **Be specific:** Include city, BHK, and budget for better results
2. **Use Indian currency format:** ₹1.2 Cr, 80 lakhs, etc.
3. **Mention status:** Add "ready to move" or "under construction"
4. **Include locality:** For more targeted results
5. **Keep it natural:** Write as you would speak

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Solution:** Ensure backend is running on port 5000

### Issue: "No results found"
**Solution:** Try broader criteria or check if CSV data is loaded

### Issue: "Internal server error"
**Solution:** Check backend logs for detailed error messages

---

## 📞 Support

For issues or questions:
- **GitHub Issues:** [Repository Issues Link]
- **Email:** your.email@example.com
- **Documentation:** This file

---

**Last Updated:** October 28, 2025  
**API Version:** 1.0.0  
**Maintained By:** Your Name

---

## 🎯 Summary

This API provides a simple yet powerful interface for natural language property search. It intelligently extracts filters, searches CSV data, and generates human-readable summaries - all while maintaining data accuracy and preventing hallucinations.
