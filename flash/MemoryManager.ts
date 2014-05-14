class MemoryManager {
    private static _viewDataObj = {};

    /**
     * 将 获得 的 json文件 解析，储存
     * @param file
     */
    public static setFileData(jsonData) {
        for (var key in jsonData) {
            MemoryManager._viewDataObj[key] = jsonData[key];
        }
    }

    /**
     *
     * @param xmlUrl
     */
    public static getXMLData(xmlUrl:string) {
        var xmlStr = ns_egret.ResourceLoader.create(xmlUrl).data;
        var xml = new ns_egret.XML(xmlStr);

        return xml;
    }

    public static getMCData(key:string) {

        return MemoryManager._viewDataObj[key];
    }

    /**
     * 获取 元件对象
     * @param key 文件路径
     */
    public static getClassMc(key:string, className = null):ns_egret.DisplayObjectContainer {
        var json = MemoryManager.getMCData(key);
        var view = MemoryManager._createView(json, className);
        return view;
    }

    private static displayMap = {
        "Bitmap": ns_egret.Bitmap,
        "BitmapText": ns_egret.BitmapText,
        "DisplayObject": ns_egret.DisplayObject,
        "DisplayObjectContainer": ns_egret.DisplayObjectContainer,
        "SimpleButton": ns_egret.SimpleButton,
        "TextField": ns_egret.TextField,
        "TextInput": ns_egret.TextInput,
        "Scale9Bitmap": ns_egret.Scale9Bitmap,
//        "ScrollView": ns_egret.ScrollView,
//        "ProgressBar": ns_egret.ProgressBar,
//        "TabView": ns_egret.TabView,
//        "TableView": ns_egret.TableView
    }

    //创建 视图
    private static _createView(data, className):ns_egret.DisplayObjectContainer {

        var realResult;
        if (className != null) {
            realResult = new className();
        }
        else {
            realResult = new ns_egret.DisplayObjectContainer();
        }

        data.width = data.width || 0;
        data.height = data.height || 0;
        realResult.width = data.width;
        realResult.height= data.height;


        MemoryManager.createChildren(realResult, data.class, data.children);

        if (realResult.createComplete) {
            realResult.createComplete();
        }

        return realResult;
    }

    private static build(data) {
        data.class = data.class || "DisplayObjectContainer";
        var displayClass = MemoryManager.displayMap[data.class];
        var result;
        if (data.class == "ProgressBar") {
            result = new displayClass(data.texturePath);
        }
        else {
            result = new displayClass();

            if (data.texturePath && data.class != "BitmapText") {

                var texture = ns_egret.TextureCache.getInstance().getTexture(data.texturePath);
                result.texture = texture;
            }
        }

        if (data.class == "TextField" || data.class == "TextInput") {
            result.fontFamily = data.fontFamily;
            result.size = data.size;
            result.textAlign = data.textAlign;
            result.text = data.text;
            result.textColor = data.textColor || 0xffffff;
        }
        else if (data.class == "BitmapText") {
            var url = data.configPath;
            //路径
            var path = "";
            if (url.lastIndexOf("/") >= 0) {
                path = url.substring(0, url.lastIndexOf("/") + 1);
            }
            //fnt配置文件 地址
            var bmpTxtUrl = url;
            //加载 fnt配置文件
            var fntData = JSON.parse(ns_egret.ResourceLoader.create(bmpTxtUrl).data);

            //字体图片集
            var fontPngUrl = path + fntData.texturePath;
            var resource = ns_egret.ResourceLoader.create(fontPngUrl);
            if (resource.state == ns_egret.ResourceLoader.LOAD_STATE_LOADED) {//图片已经加载
                result.bitmapFontData = fntData.data;
                result.texture = ns_egret.TextureCache.getInstance().getTexture(fontPngUrl);
            }
            else {
                ns_egret.Logger.fatal("请先加载资源：", fontPngUrl);
            }
            result.text = data.text;
        }
        else if (data.class == "Scale9Bitmap") {
            result.setScaleGrid(Math.max(data.top, 1), Math.max(data.bottom, 1),
                Math.max(data.left, 1), Math.max(data.right, 1));
        }

        if (data.anchorX || data.anchorY) {
            result.relativeAnchorPointX = data.anchorX || 0;
            result.relativeAnchorPointY = data.anchorY || 0;
        }

        if (data.x != null) {
            result.x = data.x;
        }
        else {
            result.x = 0;
        }

        if (data.y != null) {
            result.y = data.y;
        }
        else {
            result.y = 0;
        }


        if (data.rotation != null) {
            result.rotation = data.rotation;
        }

        if (data.scaleX != null) {
            result.scaleX = data.scaleX;
        }
        if (data.scaleY != null) {
            result.scaleY = data.scaleY;
        }

        if (data.visible != null) {
            result.visible = data.visible;
        }

        if (data.alpha != null) {
            result.alpha = data.alpha;
        }

        if (data.class == "Bitmap" || data.class == "BitmapText") {

        }
        else if (data.class == "TextField") {
            result.width = data.width;
            result.height= data.height;
        }
        else {
            data.width = data.width || 0;
            data.height = data.height || 0;
            result.width = data.width;
            result.height= data.height;
        }

        return result;
    }

    private static loop(data) {
        var result = MemoryManager.build(data);

        if (data.children) {
            MemoryManager.createChildren(result, data.class, data.children);
        }
        if (data.class == "TabView") {
            result.init();
        }
        return result;
    }

    private static createChildren(container, classDataName, childrenData) {
        if (childrenData) {
            childrenData.forEach(function (childData) {
                var displayChild = MemoryManager.loop(childData);
                container.addChild(displayChild);
                if (childData["name"]) {
                    container[childData["name"]] = displayChild;

                    displayChild["name"] = childData["name"];
                }

                if (classDataName == "SimpleButton") {
                    if (childData["class"] == "Bitmap"
                        && (childData["frame"] == 1 || childData["frame"] == 2)) {
                        container.initFrameRes(childData["texturePath"], childData["frame"], displayChild);
                    }
                    else if (childData["frame"] == 9) {
                        container.initFontTextField(displayChild);
                    }
                }
            });

            if (classDataName == "ScrollView" && childrenData) {
                var container = container.getChildAt(0);
                var rect = container.getBounds();

                container.setContainer(container, rect.width, rect.height);
            }
        }
    }
}
