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
var config_1 = require("../../config");
var Fly = require('../utils/fly');
var tokenFly = new Fly;
var fly = new Fly;
var accountInfo = wx.getAccountInfoSync();
var store_1 = require("../store");
fly.config.baseURL = config_1.ApiBaseUrl[accountInfo.miniProgram.envVersion] ? config_1.ApiBaseUrl[accountInfo.miniProgram.envVersion] : config_1.ApiBaseUrl.release;
fly.interceptors.request.use(function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                request.headers['appid'] = accountInfo.miniProgram.appId;
                if (!(request.body && request.body.isNotPermission)) return [3, 1];
                return [3, 7];
            case 1:
                token = wx.getStorageSync('token');
                if (!(token && token !== '')) return [3, 4];
                request.headers['sessionKey'] = token;
                if (!!store_1.store.userInfo) return [3, 3];
                fly.lock();
                return [4, getUserinfo(token)];
            case 2:
                _a.sent();
                fly.unlock();
                return [2, request];
            case 3: return [3, 7];
            case 4:
                fly.lock();
                return [4, login()];
            case 5:
                token = _a.sent();
                if (!!store_1.store.userInfo) return [3, 7];
                fly.lock();
                return [4, getUserinfo(token)];
            case 6:
                _a.sent();
                request.headers['sessionKey'] = token;
                fly.unlock();
                return [2, request];
            case 7: return [2, request];
        }
    });
}); });
fly.interceptors.response.use(function (response) {
    var _this = this;
    if (response.data.code === 'C501') {
        this.lock();
        var token = wx.getStorageSync('token');
        return tokenFly.get("/util/checkSessionKey.do?sessionKey=" + token)
            .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(result.data.code === 'C200')) return [3, 2];
                        if (!!result.data.data) return [3, 2];
                        return [4, login()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.unlock();
                        return [2];
                }
            });
        }); })
            .then(function () {
            return fly.request(response.request);
        });
    }
    else {
        if (response.data.code === 'C500') {
            wx.showToast({
                title: response.data.message,
                icon: 'none'
            });
        }
        return response.data;
    }
}, function (err) {
});
function login() {
    return new Promise(function (resolve, reject) {
        console.log(getCurrentPages());
        wx.login({
            success: function (res) {
                if (res.code) {
                    return tokenFly.post('/sso/wxLogin.do', { code: res.code }).then(function (result) {
                        if (result.data.code === 'C200') {
                            wx.setStorageSync('token', result.data.data.sessionKey);
                            resolve(result.data.data.sessionKey);
                        }
                    });
                }
                else {
                    console.log('登录失败！' + res.errMsg);
                    resolve();
                }
            },
            fail: function (err) {
                debugger;
                console.log('登录失败！' + err);
                resolve();
            }
        });
    });
}
function getUserinfo(sessionKey) {
    return new Promise(function (resolve, reject) {
        tokenFly.get('/user/getUserInfo.do', {}, { headers: { sessionKey: sessionKey } }).then(function (result) {
            if (result.data.code === 'C200') {
                store_1.store.setUserInfo({ userInfo: result.data.data });
                resolve();
            }
            else if (result.data.code === 'C501') {
                login().then(function (_sessionKey) {
                    tokenFly.get('/user/getUserInfo.do', {}, { headers: { sessionKey: _sessionKey } }).then(function (result) {
                        if (result.data.code === 'C200') {
                            store_1.store.setUserInfo({ userInfo: result.data.data });
                            resolve();
                        }
                    });
                });
            }
        });
    });
}
exports.default = fly;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUM7QUFDekMsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ25DLElBQU0sUUFBUSxHQUFFLElBQUksR0FBRyxDQUFDO0FBQ3hCLElBQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFBO0FBQ25CLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO0FBQzNDLGtDQUFnQztBQUdoQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQVUsQ0FBQyxPQUFPLENBQUE7QUFJekksR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQU8sT0FBWTs7Ozs7Z0JBRTVDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUE7cUJBSW5ELENBQUEsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQSxFQUE1QyxjQUE0Qzs7O2dCQUkxQyxLQUFLLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtxQkFDbEMsQ0FBQSxLQUFLLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQSxFQUFyQixjQUFxQjtnQkFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUE7cUJBQ2pDLENBQUMsYUFBSyxDQUFDLFFBQVEsRUFBZixjQUFlO2dC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QUN0SSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTs0QkFDL0IsYUFBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7NEJBQ2pELE9BQU8sRUFBRSxDQUFBO3lCQUNWO29CQUNILENBQUMsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQyxDQUFBO2FBQ0g7UUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVELGtCQUFlLEdBQUcsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwaUJhc2VVcmwgfSBmcm9tICcuLi8uLi9jb25maWcnXHJcbmNvbnN0IEZseSA9IHJlcXVpcmUoJy4uL3V0aWxzL2ZseScpXHJcbmNvbnN0IHRva2VuRmx5PSBuZXcgRmx5O1xyXG5jb25zdCBmbHkgPSBuZXcgRmx5XHJcbmNvbnN0IGFjY291bnRJbmZvID0gd3guZ2V0QWNjb3VudEluZm9TeW5jKClcclxuaW1wb3J0IHsgc3RvcmUgfSBmcm9tICcuLi9zdG9yZSdcclxuXHJcbi8vIGJhc2UgdXJsIFxyXG5mbHkuY29uZmlnLmJhc2VVUkwgPSBBcGlCYXNlVXJsW2FjY291bnRJbmZvLm1pbmlQcm9ncmFtLmVudlZlcnNpb25dID8gQXBpQmFzZVVybFthY2NvdW50SW5mby5taW5pUHJvZ3JhbS5lbnZWZXJzaW9uXSA6IEFwaUJhc2VVcmwucmVsZWFzZVxyXG5cclxuXHJcbi8v5re75Yqg6K+35rGC5oum5oiq5ZmoXHJcbmZseS5pbnRlcmNlcHRvcnMucmVxdWVzdC51c2UoYXN5bmMgKHJlcXVlc3Q6IGFueSkgPT4ge1xyXG4gICAgLy/nu5nmiYDmnInor7fmsYLlpLTpg6jmt7vliqBhcHBpZFxyXG4gICAgcmVxdWVzdC5oZWFkZXJzWydhcHBpZCddPSBhY2NvdW50SW5mby5taW5pUHJvZ3JhbS5hcHBJZFxyXG5cclxuICAgIC8vIOWmguaenCBib2R5IGlzTm90UGVybWlzc2lvbiA9IHRydWUg5YiZ6KGo56S65YWN5p2D6ZmQXHJcbiAgICAvLyDlhY3mnYPpmZAg5YiZ5LiN55So6I635Y+WdG9rZW4g5ZKMIOeUqOaIt+S/oeaBr1xyXG4gICAgaWYgKHJlcXVlc3QuYm9keSAmJiByZXF1ZXN0LmJvZHkuaXNOb3RQZXJtaXNzaW9uKSB7XHJcbiAgICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy/nu5nmiYDmnInor7fmsYLmt7vliqDoh6rlrprkuYloZWFkZXJcclxuICAgICAgbGV0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoJ3Rva2VuJylcclxuICAgICAgaWYgKHRva2VuICYmIHRva2VuICE9PSAnJykge1xyXG4gICAgICAgICAgcmVxdWVzdC5oZWFkZXJzWydzZXNzaW9uS2V5J10gPSB0b2tlblxyXG4gICAgICAgICAgaWYgKCFzdG9yZS51c2VySW5mbykge1xyXG4gICAgICAgICAgICBmbHkubG9jaygpO1xyXG4gICAgICAgICAgICBhd2FpdCBnZXRVc2VyaW5mbyh0b2tlbilcclxuICAgICAgICAgICAgZmx5LnVubG9jaygpOy8v6Kej6ZSB5ZCO77yM5Lya57un57ut5Y+R6LW36K+35rGC6Zif5YiX5Lit55qE5Lu75Yqh77yM6K+m5oOF6KeB5ZCO6Z2i5paH5qGjXHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0OyAvL+WPquacieacgOe7iOi/lOWbnnJlcXVlc3Tlr7nosaHml7bvvIzljp/mnaXnmoTor7fmsYLmiY3kvJrnu6fnu61cclxuICAgICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGZseS5sb2NrKCk7XHJcbiAgICAgICAgICB0b2tlbiA9IGF3YWl0IGxvZ2luKClcclxuICAgICAgICAgIGlmICghc3RvcmUudXNlckluZm8pIHtcclxuICAgICAgICAgICAgZmx5LmxvY2soKTtcclxuICAgICAgICAgICAgYXdhaXQgZ2V0VXNlcmluZm8odG9rZW4pXHJcbiAgICAgICAgICAgIHJlcXVlc3QuaGVhZGVyc1snc2Vzc2lvbktleSddID0gdG9rZW5cclxuICAgICAgICAgICAgZmx5LnVubG9jaygpOy8v6Kej6ZSB5ZCO77yM5Lya57un57ut5Y+R6LW36K+35rGC6Zif5YiX5Lit55qE5Lu75Yqh77yM6K+m5oOF6KeB5ZCO6Z2i5paH5qGjXHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0OyAvL+WPquacieacgOe7iOi/lOWbnnJlcXVlc3Tlr7nosaHml7bvvIzljp/mnaXnmoTor7fmsYLmiY3kvJrnu6fnu61cclxuICAgICAgICAgIH0gICAgIFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgXHQvL+e7iOatouivt+axglxyXG4gIFx0Ly92YXIgZXJyPW5ldyBFcnJvcihcInh4eFwiKVxyXG4gIFx0Ly9lcnIucmVxdWVzdD1yZXF1ZXN0XHJcbiAgXHQvL3JldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJcIikpXHJcbiAgXHJcbiAgICAvL+WPr+S7peaYvuW8j+i/lOWbnnJlcXVlc3QsIOS5n+WPr+S7peS4jei/lOWbnu+8jOayoeaciei/lOWbnuWAvOaXtuaLpuaIquWZqOS4rem7mOiupOi/lOWbnnJlcXVlc3RcclxuICAgIHJldHVybiByZXF1ZXN0O1xyXG59KVxyXG4gXHJcbi8v5re75Yqg5ZON5bqU5oum5oiq5Zmo77yM5ZON5bqU5oum5oiq5Zmo5Lya5ZyodGhlbi9jYXRjaOWkhOeQhuS5i+WJjeaJp+ihjFxyXG5mbHkuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLnVzZShcclxuICBmdW5jdGlvbiAocmVzcG9uc2U6IHsgZGF0YTogeyBjb2RlOiBzdHJpbmc7IG1lc3NhZ2U6IGFueTsgfTsgcmVxdWVzdDogYW55OyB9KSB7ICAvL+S4jeimgeS9v+eUqOeureWktOWHveaVsO+8jOWQpuWImeiwg+eUqHRoaXMubG9jaygp5pe277yMdGhpc+aMh+WQkeS4jeWvuVxyXG4gICAgaWYgKHJlc3BvbnNlLmRhdGEuY29kZSA9PT0gJ0M1MDEnKSB7XHJcbiAgICAgIHRoaXMubG9jaygpXHJcbiAgICAgIGNvbnN0IHRva2VuID0gd3guZ2V0U3RvcmFnZVN5bmMoJ3Rva2VuJylcclxuICAgICAgcmV0dXJuIHRva2VuRmx5LmdldChgL3V0aWwvY2hlY2tTZXNzaW9uS2V5LmRvP3Nlc3Npb25LZXk9JHt0b2tlbn1gKVxyXG4gICAgICAudGhlbihhc3luYyAocmVzdWx0OiB7IGRhdGE6IHsgY29kZTogc3RyaW5nOyBkYXRhOiBhbnk7IH07IH0pID0+IHtcclxuICAgICAgICBpZiAocmVzdWx0LmRhdGEuY29kZSA9PT0gJ0MyMDAnKSB7XHJcbiAgICAgICAgICBpZiAoIXJlc3VsdC5kYXRhLmRhdGEpIHtcclxuICAgICAgICAgICAgYXdhaXQgbG9naW4oKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVubG9jaygpXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAvLyBsb2coYOmHjeaWsOivt+axgu+8mnBhdGg6JHtyZXNwb25zZS5yZXF1ZXN0LnVybH3vvIxiYXNlVVJMOiR7cmVzcG9uc2UucmVxdWVzdC5iYXNlVVJMfWApXHJcbiAgICAgICAgcmV0dXJuIGZseS5yZXF1ZXN0KHJlc3BvbnNlLnJlcXVlc3QpO1xyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy/lj6rlsIbor7fmsYLnu5PmnpznmoRkYXRh5a2X5q616L+U5ZueXHJcbiAgICAgIGlmIChyZXNwb25zZS5kYXRhLmNvZGUgPT09ICdDNTAwJykge1xyXG4gICAgICAgIHd4LnNob3dUb2FzdCh7XHJcbiAgICAgICAgICB0aXRsZTogcmVzcG9uc2UuZGF0YS5tZXNzYWdlLFxyXG4gICAgICAgICAgaWNvbjogJ25vbmUnXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgZnVuY3Rpb24gKGVycjogYW55KSB7XHJcbiAgICAvL+WPkeeUn+e9kee7nOmUmeivr+WQjuS8mui1sOWIsOi/memHjFxyXG4gICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFwic3Nzc1wiKVxyXG4gIH1cclxuKVxyXG5cclxuZnVuY3Rpb24gbG9naW4gKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogKGFyZzA6IHVuZGVmaW5lZCkgPT4gdm9pZCxyZWplY3Q6IGFueSkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coZ2V0Q3VycmVudFBhZ2VzKCkpXHJcbiAgICB3eC5sb2dpbih7XHJcbiAgICAgIHN1Y2Nlc3MgKHJlcykge1xyXG4gICAgICAgICAgaWYgKHJlcy5jb2RlKSB7XHJcbiAgICAgICAgICAgIC8v5Y+R6LW3572R57uc6K+35rGCXHJcbiAgICAgICAgICAgIHJldHVybiB0b2tlbkZseS5wb3N0KCcvc3NvL3d4TG9naW4uZG8nLCB7IGNvZGU6IHJlcy5jb2RlIH0pLnRoZW4oKHJlc3VsdDogeyBkYXRhOiB7IGNvZGU6IHN0cmluZzsgZGF0YTogeyBzZXNzaW9uS2V5OiBhbnk7IH07IH07IH0pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdC5kYXRhLmNvZGUgPT09ICdDMjAwJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHd4LnNldFN0b3JhZ2VTeW5jKCd0b2tlbicsIHJlc3VsdC5kYXRhLmRhdGEuc2Vzc2lvbktleSlcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdC5kYXRhLmRhdGEuc2Vzc2lvbktleSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfnmbvlvZXlpLHotKXvvIEnICsgcmVzLmVyck1zZylcclxuICAgICAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGZhaWwgKGVycikge1xyXG4gICAgICAgIGRlYnVnZ2VyXHJcbiAgICAgICAgY29uc29sZS5sb2coJ+eZu+W9leWksei0pe+8gScgKyBlcnIpXHJcbiAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSkgICAgIFxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRVc2VyaW5mbyAoc2Vzc2lvbktleTogYW55KSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAoKSA9PiB2b2lkLCByZWplY3Q6IGFueSkgPT4ge1xyXG4gICAgdG9rZW5GbHkuZ2V0KCcvdXNlci9nZXRVc2VySW5mby5kbycsIHt9LCB7IGhlYWRlcnM6IHsgc2Vzc2lvbktleTogc2Vzc2lvbktleSB9IH0pLnRoZW4oKHJlc3VsdDogeyBkYXRhOiB7IGNvZGU6IHN0cmluZzsgZGF0YTogYW55OyB9OyB9KSA9PiB7XHJcbiAgICAgIGlmKHJlc3VsdC5kYXRhLmNvZGUgPT09ICdDMjAwJykge1xyXG4gICAgICAgICAgc3RvcmUuc2V0VXNlckluZm8oeyB1c2VySW5mbzogcmVzdWx0LmRhdGEuZGF0YSB9KVxyXG4gICAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgIH0gZWxzZSBpZiAocmVzdWx0LmRhdGEuY29kZSA9PT0gJ0M1MDEnKSB7XHJcbiAgICAgICAgLy8gdG9rZW4g6L+H5pyfXHJcbiAgICAgICAgbG9naW4oKS50aGVuKChfc2Vzc2lvbktleTogYW55KSA9PiB7XHJcbiAgICAgICAgICB0b2tlbkZseS5nZXQoJy91c2VyL2dldFVzZXJJbmZvLmRvJywge30sIHsgaGVhZGVyczogeyBzZXNzaW9uS2V5OiBfc2Vzc2lvbktleSB9IH0pLnRoZW4oKHJlc3VsdDogeyBkYXRhOiB7IGNvZGU6IHN0cmluZzsgZGF0YTogYW55OyB9OyB9KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuZGF0YS5jb2RlID09PSAnQzIwMCcpIHtcclxuICAgICAgICAgICAgICBzdG9yZS5zZXRVc2VySW5mbyh7IHVzZXJJbmZvOiByZXN1bHQuZGF0YS5kYXRhIH0pXHJcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmbHkiXX0=