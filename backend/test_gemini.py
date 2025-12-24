# import os
# from dotenv import load_dotenv
# import google.generativeai as genai

# load_dotenv()
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# model = genai.GenerativeModel('gemini-pro')
# response = model.generate_content("Hello, are you working?")
# print(response.text)
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found in .env file")
else:
    print(f"✅ Found API Key: {api_key[:5]}...{api_key[-5:]}")
    
    try:
        genai.configure(api_key=api_key)
        print("\n🔎 Searching for available models...")
        
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - Found: {m.name}")
                available_models.append(m.name)
        
        if not available_models:
            print("\n❌ No models found! Your API key might be invalid or has no access.")
        else:
            print(f"\n✨ SUCCESS! Use this model name in your code: {available_models[0]}")
            
            # Test the first model
            print(f"\n🧪 Testing {available_models[0]}...")
            model = genai.GenerativeModel(available_models[0])
            response = model.generate_content("Hi")
            print(f"🤖 AI Reply: {response.text}")

    except Exception as e:
        print(f"\n❌ API Error: {e}")