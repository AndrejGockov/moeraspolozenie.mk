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
- Viewing old quiz answers 
- Fun Facts from HBSC teens in North Macedonia in Homepage
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
REACT_APP_FIREBASE_API_KEY=your_real_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_real_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_real_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_real_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_real_sender_id
REACT_APP_FIREBASE_APP_ID=your_real_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_real_measurement_id
REACT_APP_GEMINI_API_KEY=your_real_gemini_key
```
4. Run the project: `npm run start`

## License

This project is licensed under the terms of the [MIT license](LICENSE).