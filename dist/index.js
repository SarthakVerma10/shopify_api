"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopify_api_1 = __importStar(require("@shopify/shopify-api"));
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('bson');
const app = express_1.default();
app.use(cors());
app.use(express_1.default.static(path.join(__dirname, 'front_end/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const url = 'mongodb+srv://CistBuzz:1234@chat.jpl47.mongodb.net/email_editor?retryWrites=true&w=majority';
const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = null;
client.connect((err, connect_client) => {
    if (err)
        console.log(err);
    db = connect_client.db('email_editor');
    console.log('connected');
});
const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;
shopify_api_1.default.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: false,
    API_VERSION: shopify_api_1.ApiVersion.April21 // all supported versions are available, as well as "unstable" and "unversioned"
});
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('login: ', API_KEY);
    let authRoute = yield shopify_api_1.default.Auth.beginAuth(req, res, SHOP, '/auth/callback', true);
    console.log('redirecting: ');
    return res.redirect(authRoute);
}));
let session = {};
app.get('/auth/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield shopify_api_1.default.Auth.validateAuthCallback(req, res, req.query); // req.query must be cast to unkown and then AuthQuery in order to be accepted
        session = yield shopify_api_1.default.Utils.loadCurrentSession(req, res, false);
        console.log('session created');
    }
    catch (error) {
        console.error(error); // in practice these should be handled more gracefully
    }
    return res.redirect('/'); // wherever you want your user to end up after OAuth completes
}));
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('home');
    // const session = await Shopify.Utils.loadCurrentSession(request, response, true)
    // console.log('session: ', session);
    res.sendFile(path.join(__dirname, 'front_end/build/index.html'));
}));
app.get('/api/session', (req, res) => {
    console.log('request for session');
    Object.keys(session).length === 0 ? res.send(false) : res.send(session);
});
app.post('/api/save/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('saveing new template for ', req.params.id);
    console.log('body: ', req.body);
    let template = req.body;
    let user = req.params.id;
    template['user'] = user;
    yield db.collection('templates').insertOne(template);
    res.send(true);
}));
app.post('/api/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('updating template ', req.params.id);
    console.log('body: ', req.body);
    const filter = { _id: ObjectId(req.params.id) };
    const updateDoc = {
        $set: {
            body: req.body.body,
            counters: req.body.counters,
            schemaVersion: req.body.schemaVersion
        }
    };
    console.log('body: ', req.body.body);
    const options = { upsert: false };
    yield db.collection('templates').updateOne(filter, updateDoc, options);
    res.send(true);
}));
app.get('/api/get/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = { user: req.params.id };
    const response = yield db.collection('templates').find(user).toArray();
    console.log('templates fetched');
    res.send(response);
}));
app.get('/api/test/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield db.collection('templates').find().toArray();
    console.log('templates all');
    res.send(response);
}));
app.post('/api/test/save/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('saveing new template for ');
    console.log('body: ', req.body);
    let template = req.body;
    yield db.collection('templates').insertOne(template);
    res.send(true);
}));
app.post('/api/test/update/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('updating template ', req.params.id);
    console.log('body: ', req.body);
    const filter = { _id: ObjectId(req.params.id) };
    const updateDoc = {
        $set: {
            body: req.body.body,
            counters: req.body.counters,
            schemaVersion: req.body.schemaVersion
        }
    };
    console.log('body: ', req.body.body);
    const options = { upsert: false };
    yield db.collection('templates').updateOne(filter, updateDoc, options);
    res.send(true);
}));
app.listen(3000, () => {
    console.log('your app is now listening on port 3000');
});
//# sourceMappingURL=index.js.map