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
    Use our curated questionnaire to figure out how your doing today, come back tomorrow and see if your doing any better.
</h3>


<br>
<br> 
<p>
<strong>moeraspolozenie.mk</strong> is a platform for checking your daily well-being and reviewing how you felt on previous days, as well as finding and saving inspirational quotes. 
</p> 


## Contributors

- Andrej Gockov
- Angel Stojmanovski

## Features

- Authentication with Firebase
- Daily quizzes
- AI recommendations based on quiz results
- Dashboard
- Statistics on answered quizzes
- Viewing old quizzes 
- Fun Facts from HBSC teens in North Macedonia on the home-page
- Daily quotes from the Zenquotes API
- Saving daily quotes

## Dependencies

```
+-- @google/genai@2.7.0
+-- @testing-library/dom@10.4.1
+-- @testing-library/jest-dom@6.9.1
+-- @testing-library/react@16.3.2
+-- @testing-library/user-event@13.5.0
+-- @types/jest@27.5.2
+-- @types/node@16.18.126
+-- @types/react-dom@19.2.3
+-- @types/react@19.2.15
+-- firebase-admin@14.0.0
+-- firebase@12.13.0
+-- gh-pages@6.3.0
+-- react-dom@19.2.6
+-- react-router-dom@7.15.1
+-- react-scripts@5.0.1
+-- react@19.2.6
+-- recharts@3.8.1
+-- tsx@4.22.4
+-- typescript@4.9.5
`-- web-vitals@2.1.4
```

## Installing and running

1. Clone the repository: `git@github.com:AndrejGockov/moeraspolozenie.mk.git`
2. Install the dependencies: `npm install`
3. In the root folder create a .env file and add this to the file: <br>
```
REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_KEY
```
4. Run the project: `npm run start`

## License

This project is licensed under the terms of the [MIT license](LICENSE).