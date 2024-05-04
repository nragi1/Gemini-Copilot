# Submission for GOOGLE AI Hackathon 2024

## Prequisite:
GCP Account

## How to set up:
- Create a Service Account with access to Vertex AI
- Create a Key in the Service Account and Select JSON
- In server.js, change the project and location with your project ID and location
- Set the JSON Key to the environmental variable in your editor
```
$env:GOOGLE_APPLICATION_CREDENTIALS="yourpath/GOOGLE_APPLICATION_CREDENTIALS.json"
```
- Run the server
```
node server.js
```
- Go to Chrome Extensions, click Load Unpacked and select the "extension" sub folder
- You will now be able to use the exension on new tabs

## How to use:
You can either click the extension logo for the chatbox to popup or right click on highlighted text and click "Explain this..." or alternatively press CTRL+SHIFT+E while text is highlighted
