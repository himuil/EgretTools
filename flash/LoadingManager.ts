class LoadingManager {

    public static DATA_TYPE_TEXT = ns_egret.ResourceLoader.DATA_TYPE_TEXT;
    public static DATA_TYPE_IMAGE = ns_egret.ResourceLoader.DATA_TYPE_IMAGE;
    public static DATA_TYPE_MC = "MC";
    public static DATA_TYPE_BMPTEXT = "bitmapTxt";
    public static DATA_TYPE_ANIMATION = "ANIMATION";


    private _ctr;
    private _allLoadedToDo;
    private _target;

    private _mcArr = [];
    private _imagesArr = [];

    constructor(allLoadedToDo, target, loadingView) {
        this._ctr = new ns_egret.LoadingController();
        this._ctr.setLoadingView(loadingView);
        this._allLoadedToDo = allLoadedToDo;
        this._target = target;
    }

    public addAnimation(name):void {
    }

    public addPreLoad(add_url:string, data_type:string, prefix:string = ""):void {

        if (data_type == LoadingManager.DATA_TYPE_MC) {
            this._mcArr.push(add_url);
            this._ctr.addResource(add_url, LoadingManager.DATA_TYPE_TEXT, prefix);
        }
        else if (data_type == LoadingManager.DATA_TYPE_BMPTEXT) {
            this._mcArr.push(add_url);
            this._ctr.addResource(add_url, LoadingManager.DATA_TYPE_TEXT, prefix);
        }
        else if (data_type == LoadingManager.DATA_TYPE_ANIMATION) {
            this._ctr.addResource("animation/" + add_url + "_texture.json", LoadingManager.DATA_TYPE_TEXT);
            this._ctr.addResource("animation/" + add_url + "_texture.png", LoadingManager.DATA_TYPE_IMAGE);
            this._ctr.addResource("animation/" + add_url + "_skeleton.json", LoadingManager.DATA_TYPE_TEXT);
        }
        else {
            this._ctr.addResource(add_url, data_type, prefix);
        }
    }

    public startLoading() {
        this._ctr.addEventListener(ns_egret.ResourceLoader.LOAD_COMPLETE, this.onResourceLoadComplete, this);
        this._ctr.load();
    }

    private onResourceLoadComplete() {
        var mcArr = this._mcArr.concat();
        this._mcArr = [];
        if (mcArr.length > 0) {
            for (var i = 0; i < mcArr.length; i++) {
                var url:string = mcArr[i];
                if (url.lastIndexOf(".jmc") >= 0 || url.lastIndexOf(".jfnt") >= 0) {//
                    var jsonStr = ns_egret.ResourceLoader.create(url).data;
                    var data = JSON.parse(jsonStr);

                    if (url.lastIndexOf(".jmc") >= 0) {//影片剪辑
                        //设置 文件视图数据
                        MemoryManager.setFileData(data["viewData"]);
                        //需要加载的资源
                        for (var key in data["resourceData"]) {
                            var tempUrl = data["resourceData"][key];
                            if (tempUrl.lastIndexOf(".jfnt") >= 0) {//艺术字
                                this.addPreLoad(tempUrl, LoadingManager.DATA_TYPE_BMPTEXT);
                            }
                            else {//图片
                                this.addPreLoad(tempUrl, LoadingManager.DATA_TYPE_IMAGE);
                            }
                        }
                    }
                    else {//艺术字
                        var path = "";
                        if (url.lastIndexOf("/") >= 0) {
                            path = url.substring(0, url.lastIndexOf("/") + 1);
                        }
                        this.addPreLoad(path + data["texturePath"], LoadingManager.DATA_TYPE_IMAGE);
                    }
                }
            }

            this._ctr.removeEventListener(ns_egret.ResourceLoader.LOAD_COMPLETE, this.onResourceLoadComplete, this);
            this.startLoading();
            return;
        }

        this._ctr.removeEventListener(ns_egret.ResourceLoader.LOAD_COMPLETE, this.onResourceLoadComplete, this);
        if (this._allLoadedToDo) {
            this._allLoadedToDo.call(this._target);
        }
    }
}

