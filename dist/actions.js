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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.sync = exports.commit = exports.exclude = exports.include = exports.show = exports.init = exports.test = void 0;
var os = require('os');
var fs = require("fs-extra");
var path = require("path");
var exec = require("child_process").exec;
var CLIPGIT_CONF_FILE = os.homedir() + "/.clipgit.json";
var CG_CONF;
var CLIPGIT_STAGE;
var TRACKED_FILES;
var INCLUDED_FILES;
var EXCLUDED_FILES;
if (fs.existsSync(CLIPGIT_CONF_FILE)) {
    CG_CONF = JSON.parse(fs.readFileSync(CLIPGIT_CONF_FILE, "utf8"));
    CLIPGIT_STAGE = CG_CONF["stage_directory"];
    TRACKED_FILES = new Set(CG_CONF["tracked"]);
    INCLUDED_FILES = new Set(CG_CONF["migrations"]["include"]);
    EXCLUDED_FILES = new Set(CG_CONF["migrations"]["exclude"]);
}
function test() {
    console.log(CG_CONF);
}
exports.test = test;
function init(staging_dir) {
    var conf = {
        "version": "1.0.0",
        "stage_directory": staging_dir,
        "tracked": [],
        "migrations": { "include": [], "exclude": [] }
    };
    fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(conf));
}
exports.init = init;
function show() {
    console.log("Tracked:", Array.from(TRACKED_FILES.values()));
    if (INCLUDED_FILES.size != 0) {
        console.log("Included:", Array.from(INCLUDED_FILES.values()));
    }
    if (EXCLUDED_FILES.size != 0) {
        console.log("Excluded:", Array.from(EXCLUDED_FILES.values()));
    }
}
exports.show = show;
function include(file) {
    INCLUDED_FILES.add(process.cwd() + "/" + file);
    CG_CONF["migrations"]["include"] = Array.from(INCLUDED_FILES.values());
    fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
    console.log("Added " + file + ", file will be synced on next migration");
}
exports.include = include;
function exclude(file) {
    var full_file = process.cwd() + "/" + file;
    if (!TRACKED_FILES.has(full_file)) {
        console.log(full_file);
        throw new Error(full_file + " unknown");
    }
    EXCLUDED_FILES.add(full_file);
    CG_CONF["migrations"]["exclude"] = Array.from(EXCLUDED_FILES.values());
    fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
    console.log("Removed " + file + ", file will be synced on next migration");
}
exports.exclude = exclude;
function commit() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exec("(cd " + CLIPGIT_STAGE + " && git add -A && git commit -m \"auto commit\" && git push)")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.commit = commit;
function sync() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("syncing...");
                    TRACKED_FILES.forEach(function (included) {
                        copy_to_stage(included);
                        console.log("-> copied " + included);
                    });
                    return [4 /*yield*/, commit()];
                case 1:
                    _a.sent();
                    console.log("committed to remote");
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sync = sync;
function migrate() {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log("migrate...");
                    EXCLUDED_FILES.forEach(function (excluded) {
                        removed_from_stage(excluded);
                        TRACKED_FILES.delete(excluded);
                        console.log("-> removed " + excluded);
                    });
                    INCLUDED_FILES.forEach(function (included) {
                        copy_to_stage(included);
                        TRACKED_FILES.add(included);
                        console.log("-> copied " + included);
                    });
                    CG_CONF["tracked"] = Array.from(TRACKED_FILES.values());
                    CG_CONF["migrations"]["include"] = [];
                    CG_CONF["migrations"]["exclude"] = [];
                    fs.writeFileSync(CLIPGIT_CONF_FILE, JSON.stringify(CG_CONF));
                    console.log("updated configs");
                    return [4 /*yield*/, commit()];
                case 1:
                    _a.sent();
                    console.log("committed to remote!");
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    console.log(e_2.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.migrate = migrate;
function copy_to_stage(file) {
    var f_name = path.basename(file);
    fs.copySync(file, CLIPGIT_STAGE + "/" + f_name);
}
function removed_from_stage(file) {
    var f_name = path.basename(file);
    fs.unlinkSync(CLIPGIT_STAGE + "/" + f_name);
}
//# sourceMappingURL=actions.js.map