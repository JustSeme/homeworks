"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDB = exports.usersCollection = exports.blogsCollection = exports.postsCollection = void 0;
const mongodb_1 = require("mongodb");
const username = "justSeme";
const password = "RMMXpX1hUlXqbKED";
let mongoURI = process.env.mongoURI || `mongodb+srv://${username}:${password}@cluster86890.fgczccf.mongodb.net/?retryWrites=true&w=majority`;
const client = new mongodb_1.MongoClient(mongoURI);
const blogPlatformDB = client.db('blog_platform');
exports.postsCollection = blogPlatformDB.collection('posts');
exports.blogsCollection = blogPlatformDB.collection('blogs');
exports.usersCollection = blogPlatformDB.collection('users');
function runDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.connect();
            yield client.db("blog_platform").command({ ping: 1 });
            console.log("Connected successfully to MongoDB server");
        }
        catch (err) {
            yield client.close();
            console.log(err);
        }
    });
}
exports.runDB = runDB;
runDB();
//# sourceMappingURL=db.js.map