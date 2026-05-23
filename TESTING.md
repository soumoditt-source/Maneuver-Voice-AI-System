# 🧪 How to Test the Maneuver Voice AI (Easy Guide)

Hey there! If you just pulled this code to your computer and want to test it out, follow these simple steps. I built this to be extremely powerful but very easy to run.

---

## Step 1: Get Your API Keys Ready
Before running anything, you need three free API keys to power the brain, voice, and connection of the AI.

1. **LiveKit Cloud:** Go to [LiveKit](https://livekit.io/), create a free account, and get your `URL`, `API Key`, and `API Secret`.
2. **Groq:** Go to [Groq Console](https://console.groq.com/), create a free account, and generate an API key. (This makes the AI think lightning fast).
3. **Deepgram:** Go to [Deepgram](https://deepgram.com/), create a free account, and get an API key. (This handles the speaking and listening).

---

## Step 2: Set Up the Environment Variables
You need to tell the code where your keys are. 

**For the Backend (Python Agent):**
1. Open the `apps/agent` folder.
2. Create a file named exactly `.env`.
3. Paste this inside and fill in your keys:
   ```text
   LIVEKIT_URL=your_livekit_url_here
   LIVEKIT_API_KEY=your_livekit_api_key_here
   LIVEKIT_API_SECRET=your_livekit_api_secret_here
   GROQ_API_KEY=your_groq_api_key_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

**For the Frontend (Next.js Website):**
1. Open the `apps/web` folder.
2. Create a file named exactly `.env.local`.
3. Paste this inside and fill in your keys:
   ```text
   NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url_here
   LIVEKIT_API_KEY=your_livekit_api_key_here
   LIVEKIT_API_SECRET=your_livekit_api_secret_here
   ```

---

## Step 3: Start the Brain (Backend)
This starts the Python AI agent that listens and talks.

1. Open your terminal and go to the agent folder:
   ```bash
   cd apps/agent
   ```
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the agent:
   ```bash
   python agent.py
   ```
*If everything worked, you will see a message saying: `🎙️ Alex is live and waiting for visitors...`*

---

## Step 4: Start the Website (Frontend)
This starts the 3D visual interface that you actually look at.

1. Open a **new** terminal window and go to the web folder:
   ```bash
   cd apps/web
   ```
2. Install the web packages:
   ```bash
   npm install
   ```
3. Start the website:
   ```bash
   npm run dev
   ```

---

## Step 5: Start Talking!
1. Open your browser and go to `http://localhost:3000` (or `http://localhost:5000` if you used a custom port).
2. Allow microphone access when the browser asks.
3. **Start talking!** Say: *"Hey, what kind of services does Maneuver offer?"* and watch the 3D screen change instantly while the AI talks back to you.

### Fun Things to Try:
- **Test the speed:** Type something into the chat box instead of speaking. The AI will read it and speak back to you instantly.
- **Test the visuals:** Ask *"How does your process work?"* and watch the Process Diagram slide pop up.
- **Test the personality:** Tell him your budget is only $100 and see how he politely rejects you like a real high-end consultant. 

Enjoy testing the world's best Voice AI!
