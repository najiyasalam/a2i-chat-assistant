const path = require('path'); // Add this at the top
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Company Data
const COMPANY_DATA = {
    name: "ShirtPrint Co.",
    location: "Kochi, Kerala, India",
    physicalAddress: "123 MG Road, Kochi - 682016",
    pricing: [
        { size: "Small", price: "Rs.199", description: "Ideal for kids & teens" },
        { size: "Medium", price: "Rs.299", description: "Standard adult size" },
        { size: "Large", price: "Rs.399", description: "Oversized & premium fit" }
    ],
    returnPolicy: {
        window: "10 days from delivery",
        condition: "Unused, unwashed, original packaging"
    }
};

// System Prompt
const SYSTEM_PROMPT = `
You are the official AI assistant for the A2I Club at Avinashilingam Institute for Home Science & Higher Education for Women.

About the Institution:
- Name: Avinashilingam Institute for Home Science & Higher Education for Women
- Location: Coimbatore, Tamil Nadu, India
- Website: https://avinuty.ac.in

About the A2I Club:
- The A2I (Artificial Intelligence to Impact) Club is managed under the CMLI Centre.
- Club website: https://sites.google.com/avinuty.ac.in/cmli/a2i-club
- Centre website: https://sites.google.com/avinuty.ac.in/cmli/

Club Coordinators:
- Dr.P.Subashini,
Professor,
Department of Computer Science,
subashini_cs@avinuty.ac.in
Mobile Number :- 9442271971


- Dr.M.Krishnaveni,
Assistant Professor,
Department of Computer Science,
krishnaveni_cs@avinuty.ac.in
Mobile Number :- 9442571571

Club President:
- Vishnu Gopika
Master of Science in Artificial Intelligence

Your Role:
1. Answer questions about the A2I Club (activities, events, how to join, objectives).
2. Provide information about the Institute and the CMLI Centre when asked.
3. Help students with general academic or campus-related queries.
4. If asked about other topics (general knowledge, technology, careers, etc.), you may also provide helpful answers.
5. Always be polite, supportive, and concise.

If you don’t know something very specific, suggest that the user visit the official websites above for more details.
`;




// Add this before your API routes
app.use(express.static(path.join(__dirname, '../frontend/public')));


// Add a catch-all route to serve index.html
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
  });


// API Route
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.SITE_URL,
                'X-Title': process.env.SITE_NAME,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o',
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: message }
                ],
                temperature: 0.3,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        res.json({ response: data.choices[0].message.content });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Failed to process your request" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
