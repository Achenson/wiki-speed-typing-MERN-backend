# wiki-speed-typing-MERN
wiki-speed-typing fullstack

Test your typing speed using random* articles from English Wikipedia. Main results are displayed every 2 seconds, detailed results are available after the timer goes off. Press '?' button for more information.
Create an account to access your top score.  App structure described in appTree.txt

\* \- articles shorter than 370 characters or containing non-english characters are skipped. All text in brackets is edited out.

Technologies used: React, Redux, GraphQL (Apollo), MongoDB, Express, JSON Web Token

## Live app

https://wikispeedtyping.herokuapp.com/

## How to run locally

1. Install nodejs - https://nodejs.org

2. create an .env file with following variables:<br />
DB - paste your atlas mongodb connection string <br />
ACCESS, REFRESH, FORGOT_PASSWORD - type long random string in each

3. (optional) If you want to use Redux DevToold browser extension, uncomment proper lines in client/src/redux/store.js

4. In the project directory run:

### `npm install` 
Installs dependencies
### `npm run dev`
Runs the app (client & server) in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
Open [http://localhost:4000/graphql](http://localhost:3000/graphql) for graphql playground

The page will reload if you make edits.<br />
You will also see any lint errors in the console.
