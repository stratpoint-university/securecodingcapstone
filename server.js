"use strict";

const express = require("express");
const favicon = require("serve-favicon");
const bodyParser = require("body-parser");
const session = require("express-session");
const consolidate = require("consolidate"); // Templating library adapter for Express
const swig = require("swig");
const MongoClient = require("mongodb").MongoClient; // Driver for connecting to MongoDB
const http = require("http");
const marked = require("marked");
const app = express(); // Web framework to handle routing requests
const routes = require("./app/routes");
const { port, db, cookieSecret } = require("./config/config"); // Application config properties

// const csrf = require('csurf');
// const helmet = require("helmet");
//const nosniff = require('dont-sniff-mimetype');

const fs = require("fs");
const https = require("https");
const path = require("path");
const httpsOptions = {
	key: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.key")),
	cert: fs.readFileSync(path.resolve(__dirname, "./artifacts/cert/server.crt")),
};

MongoClient.connect(db, (err, db) => {
	if (err) {
		console.log("Error: DB: connect");
		console.log(err);
		process.exit(1);
	}
	console.log(`Connected to the database`);

	app.disable("x-powered-by");
	app.use(helmet.frameguard());
	app.use(helmet.noCache());
	app.use(helmet.contentSecurityPolicy());
	app.use(helmet.hsts());
	app.use(nosniff());

	// Adding/ remove HTTP Headers for security
	app.use(favicon(__dirname + "/app/assets/favicon.ico"));

	// Express middleware to populate "req.body" so we can access POST variables
	app.use(bodyParser.json());
	app.use(
		bodyParser.urlencoded({
			// Mandatory in Express v4
			extended: false,
		})
	);

	// Enable session management using express middleware
	app.use(
		session({
			genid: (req) => {
				return genuuid();
			},
			key: "sessionId",
			cookie: {
				httpOnly: true,
				// Remember to start an HTTPS server to get this working
				// secure: true
			},
			maxAge: 24 * 60 * 60 * 1000,
			secret: cookieSecret,
			// Both mandatory in Express v4
			saveUninitialized: true,
			resave: true,
		})
	);

	app.use(csrf());
	app.use((req, res, next) => {
		res.locals.csrftoken = req.csrfToken();
		next();
	});

	// Register templating engine
	app.engine(".html", consolidate.swig);
	app.set("view engine", "html");
	app.set("views", `${__dirname}/app/views`);
	app.use(express.static(`${__dirname}/app/assets`));

	// Initializing marked library
	marked.setOptions({
		sanitize: true,
	});
	app.locals.marked = marked;

	// Application routes
	routes(app, db);

	// Template system setup
	swig.setDefaults({
		// Autoescape disabled
		autoescape: true,
	});

	// HTTP connection
	https.createServer(httpsOptions, app).listen(port, () => {
		console.log(`Express http server listening on port ${port}`);
	});
});
