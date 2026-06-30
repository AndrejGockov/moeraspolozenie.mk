<h1 align="center">
    moeraspolozenie.mk
</h1>

<p align="center">
    <img src="/assets/logo.png" alt="moeraspolozenie Logo" width="256" height="256">
</p>


<h1 align="center">
    Do you have a minute to self reflect today?
</h1>


<h3 align="center">
    Use our curated questionnaire to figure out how you're doing today, come back tomorrow and see if you're doing any better.
</h3>


<br>
<br> 
<p>
<strong>moeraspolozenie.mk</strong> is a platform for checking your daily well-being and reviewing how you felt on previous days, as well as finding and saving your favorite daily inspirational quotes. 
</p> 


## Contributors

- Andrej Gockov
- Angel Stojmanovski

## Features

- Authentication with Firebase
- Daily wellness quiz
- AI recommendations based on your quiz results
- Your personal dashboard
- Well-being statistics based on your past quizzes
- Quiz history log
- Daily inspirational quotes fetched from Zenquotes API
- Bookmark your favorite quotes
- Fun facts from HBSC about teens in North Macedonia displayed on the home-page


## Dependencies

```
+-- @google/genai@2.10.0
+-- @testing-library/dom@10.4.0
+-- @testing-library/jest-dom@6.6.3
+-- @testing-library/react@16.3.2
+-- @testing-library/user-event@14.6.1
+-- @types/jest@30.0.0
+-- @types/node@26.0.1
+-- @types/react-dom@19.2.3
+-- @types/react@19.2.17
+-- @vercel/node@5.8.22
+-- firebase-admin@14.1.0
+-- firebase@12.15.0
+-- react-dom@19.2.7
+-- react-router-dom@7.18.1
+-- react-scripts@5.0.1
+-- react@19.2.7
+-- recharts@3.9.1
+-- tsx@4.19.3
+-- typescript@6.0.3
`-- web-vitals@5.3.0

Dev Dependencies:
`-- tsx@4.19.3
```

## Installing and running

1. Clone the repository: `git@github.com:AndrejGockov/moeraspolozenie.mk.git`
2. Install the dependencies: `npm install`
3. In the root folder create a .env file and replace the dummy Firebase and Gemini API keys with your actual ones if you're self-hosting locally (Or if you're using Vercel add these as environment variables): <br>
```
REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```
4. Run the project: `npm run start`

## License

This project is licensed under the terms of the [MIT license](LICENSE).
