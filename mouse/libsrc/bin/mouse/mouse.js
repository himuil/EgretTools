//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var mouse;
(function (mouse) {
    var currentTarget;
    var stageObj;
    var isPC;
    var dispatch = function (type, bubbles, x, y, touchPointID) {
        if (type == "rollOver" && currentTarget.isRollOver) {
            return;
        }
        if (type == "rollOver") {
            currentTarget.isRollOver = true;
        }
        else if (type == "rollOut") {
            delete currentTarget.isRollOver;
        }
        //处理鼠标手型
        if (isPC) {
            try {
                var canvas = stageObj.$displayList.renderBuffer.surface;
                ;
                if (type == "rollOver") {
                    canvas.style.cursor = "pointer";
                }
                else if (type == "rollOut") {
                    canvas.style.cursor = "default";
                }
            }
            catch (e) {
            }
        }
        egret.TouchEvent.dispatchTouchEvent(currentTarget, type, bubbles, false, x, y, touchPointID);
    };
    mouse.enable = function (stage) {
        isPC = egret.Capabilities.os == "Windows PC" || egret.Capabilities.os == "Mac OS";
        stageObj = stage;
        var onTouchMove = egret.sys.TouchHandler.prototype.onTouchMove;
        var check = function (x, y, touchPointID) {
            if (currentTarget && !currentTarget.$stage) {
                currentTarget = null;
            }
            var result = stage.$hitTest(x, y);
            if (result != null && result != stage) {
                if (!currentTarget) {
                    currentTarget = result;
                    dispatch("rollOver", false, x, y, touchPointID);
                    dispatch("mouseOver", true, x, y, touchPointID);
                }
                else if (result != currentTarget) {
                    dispatch("mouseOut", true, x, y, touchPointID);
                    if (!currentTarget.$hitTest(x, y)) {
                        dispatch("rollOut", false, x, y, touchPointID);
                    }
                    currentTarget = result;
                    dispatch("rollOver", false, x, y, touchPointID);
                    dispatch("mouseOver", true, x, y, touchPointID);
                }
            }
            else {
                if (currentTarget) {
                    dispatch("mouseOut", true, x, y, touchPointID);
                    dispatch("rollOut", false, x, y, touchPointID);
                    currentTarget = null;
                }
            }
        };
        egret.sys.TouchHandler.prototype.onTouchMove = function (x, y, touchPointID) {
            onTouchMove.call(this, x, y, touchPointID);
            check(x, y, touchPointID);
        };
    };
    mouse.setButtonMode = function (displayObjcet, buttonMode) {
        displayObjcet["buttonModeForMouse"] = buttonMode;
    };
})(mouse || (mouse = {}));

