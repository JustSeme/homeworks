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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const users_db_repository_1 = require("../repositories/users-db-repository");
exports.usersService = {
    createUser(login, password, email) {
        return __awaiter(this, void 0, void 0, function* () {
            //const passwordSalt = await bcrypt.genSalt(10)
            const passwordHash = yield bcrypt_1.default.hash(password, 10);
            const newUser = {
                id: (0, crypto_1.randomUUID)(),
                login: login,
                email: email,
                passwordHash,
                createdAt: new Date().toISOString()
            };
            users_db_repository_1.usersRepository.createUser(newUser);
            const displayedUser = {
                id: newUser.id,
                login: newUser.login,
                email: newUser.email,
                createdAt: newUser.createdAt
            };
            return displayedUser;
        });
    },
    checkCredentials(loginOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield users_db_repository_1.usersRepository.findUserByLoginOrEmail(loginOrEmail);
            if (!user)
                return false;
            return bcrypt_1.default.compare(password, user.passwordHash);
            /* const passwordHash = await this._generateHash(password, user.passwordSalt)
            if(user.passwordHash !== passwordHash) return false
    
            return true */
        });
    },
    deleteUsers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userId) {
                return yield users_db_repository_1.usersRepository.deleteUser(userId);
            }
            return yield users_db_repository_1.usersRepository.deleteUsers();
        });
    }
};
//# sourceMappingURL=users-service.js.map