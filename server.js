// const express = require('express');
// const path = require('path');
// const cors = require('cors');
// const http = require('http');

// const app = express();

// /**
//  * allow cross origin
//  */
// app.use(cors());

// /**
//  * Point static path to dist
//  */
// app.use(express.static(path.join(__dirname, 'dist')));

// /**
//  * Catch all other routes and return the index file
//  */
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

// /**
//  * Get port from environment and store in Express.
//  */
// const port = process.env['NODE_PORT'] || 2122;
// app.set('port', port);

// /**
//  * Create HTTP server.
//  */
// const server = http.createServer(app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */
// server.listen(port, () => console.log(`Server is running on:${port}`));


const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static('./dist'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/index.html'}),
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
