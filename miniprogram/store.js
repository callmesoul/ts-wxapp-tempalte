"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
var mobx_miniprogram_1 = require("mobx-miniprogram");
exports.store = mobx_miniprogram_1.observable({
    userInfo: null,
    get sum() {
        return this.numA + this.numB;
    },
    update: mobx_miniprogram_1.action(function () {
        var sum = this.sum;
        this.numA = this.numB;
        this.numB = sum;
    })
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBcUQ7QUFHeEMsUUFBQSxLQUFLLEdBQU8sNkJBQVUsQ0FBQztJQUdoQyxRQUFRLEVBQUUsSUFBSTtJQUlkLElBQUksR0FBRztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO0lBQzlCLENBQUM7SUFHRCxNQUFNLEVBQUUseUJBQU0sQ0FBQztRQUNiLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUE7UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFBO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFBO0lBQ2pCLENBQUMsQ0FBQztDQUVMLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG9ic2VydmFibGUsIGFjdGlvbiB9IGZyb20gJ21vYngtbWluaXByb2dyYW0nXHJcblxyXG5cclxuZXhwb3J0IGNvbnN0IHN0b3JlOmFueSA9IG9ic2VydmFibGUoe1xyXG5cclxuICAgIC8vIOaVsOaNruWtl+autVxyXG4gICAgdXNlckluZm86IG51bGwsXHJcbiAgICBcclxuICBcclxuICAgIC8vIOiuoeeul+WxnuaAp1xyXG4gICAgZ2V0IHN1bSgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubnVtQSArIHRoaXMubnVtQlxyXG4gICAgfSxcclxuICBcclxuICAgIC8vIGFjdGlvbnNcclxuICAgIHVwZGF0ZTogYWN0aW9uKGZ1bmN0aW9uICh0aGlzOiBhbnkpIHtcclxuICAgICAgY29uc3Qgc3VtID0gdGhpcy5zdW1cclxuICAgICAgdGhpcy5udW1BID0gdGhpcy5udW1CXHJcbiAgICAgIHRoaXMubnVtQiA9IHN1bVxyXG4gICAgfSlcclxuICBcclxufSkiXX0=