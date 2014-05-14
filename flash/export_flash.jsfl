var dom = fl.getDocumentDOM();
var lib = dom.library;

var resPrefix = "assets/480/";
var path = dom.path;
var pathIndex = path.indexOf(resPrefix);
path = path.slice(pathIndex + resPrefix.length);
path = path.replace(dom.name,"");

var bitmapNameList = [];

var JSON = function () {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            'boolean': function (x) {
                return String(x);
            },
            number: function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            string: function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            },
            object: function (x) {
                if (x) {
                    var a = [], b, f, i, l, v;
                    if (x instanceof Array) {
                        a[0] = '[';
                        l = x.length;
                        for (i = 0; i < l; i += 1) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a[a.length] = v;
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = ']';
                    } else if (x instanceof Object) {
                        a[0] = '{';
                        for (i in x) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a.push(s.string(i), ':', v);
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = '}';
                    } else {
                        return;
                    }
                    return a.join('');
                }
                return 'null';
            }
        };
    return {
        copyright: '(c)2005 JSON.org',
        license: 'http://www.crockford.com/JSON/license.html',

        stringify: function (v) {
            var f = s[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    return v;
                }
            }
            return null;
        },

        parse: function (text) {
            try {
                return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                        text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
                    eval('(' + text + ')');
            } catch (e) {
                return false;
            }
        }
    };
}();

var loopContainer = function (data, element){
		var isScale9Bitmap = element && element.libraryItem.scalingGrid;
		if(isScale9Bitmap)
		{
			data.class = "Scale9Bitmap";
			data.width = element.width;
			data.height = element.height;
		}
		var timeline = dom.getTimeline();
		var layerLength = timeline.layers.length;
		for(var i = 0 ; i < layerLength ; i++)
		{
			var layer = timeline.layers[i];
			var frame = layer.frames[0];
			var elementsLength = frame.elements.length;
			var elementList = [];
			for(var j = 0 ; j < elementsLength ; j++)
			{
				var childElement = frame.elements[j];
				elementList[childElement.depth] = childElement;
			}
			for(var j = 0 ; j < elementList.length ; j++)
			{
				var childElement = elementList[j];
				var childData = {};
				var scale9Data = loop(childElement, childData, element);
				if(JSON.stringify(childData) != "{}")
				{
					//data.children[childElement.depth - 1] = childData;
					data.children.unshift(childData);
				}
				if(isScale9Bitmap)
				{
					delete data.children;
					if(scale9Data)
					{
						data.texturePath = scale9Data.texturePath;
						var rect = element.libraryItem.scalingGridRect;
						data.top = rect.top;
						data.bottom = data.height - rect.bottom;
						data.left = rect.left;
						data.right = data.width - rect.right;
					}
					return;
				}
			}
		}
}

var loop = function (element, data, parentElement){
	var isScale9Bitmap = parentElement && parentElement.libraryItem.scalingGrid;
	if(isScale9Bitmap)
	{
		if(element.instanceType == "bitmap")
		{
			if(bitmapNameList.indexOf(element.libraryItem.name) == -1)
			{
				bitmapNameList.push(element.libraryItem.name);
			}
			return {texturePath:path + element.libraryItem.name, width:element.width, height:element.height};
		}
		else
		{
			fl.trace("Scale9BitmapError");
		}
		return;
	}
	if(!element)
	{
		return;
	}
	data.x = element.x;
	data.y = element.y;
	data.width = element.width;
	data.height = element.height;
	if(element.scaleX != 1)
	{
		data.scaleX = element.scaleX;
	}
	if(element.scaleY != 1)
	{
		data.scaleY = element.scaleY;
	}
	if(element.name)
	{
		data.name = element.name;
	}
	if(element.symbolType == "movie clip")
	{
		
		data.class = "DisplayObjectContainer";
		data.children = [];
		lib.editItem(element.libraryItem.name);
		loopContainer(data, element);
	}
	else if(element.instanceType == "bitmap")
	{
		var textureName = element.libraryItem.name;
		data.texturePath = path + textureName;
		data.class = "Bitmap";
		if(bitmapNameList.indexOf(textureName) == -1)
		{
			bitmapNameList.push(textureName);
		}

		if(parentElement && parentElement.symbolType == "button")
		{
			var index = textureName.indexOf(".");
			var tag = textureName.slice(index - 1, index);
			if(parseInt(tag) != NaN)
			{
				data.frame = parseInt(tag);
			}
		}
	}
	else if(element.elementType == "text")
	{
		var textAttr = element.textRuns[0].textAttrs;
		data.size = textAttr.size;
		data.textColor = textAttr.fillColor;
		data.textAlign = textAttr.alignment;
		data.font = textAttr.face;
		var text = "";
		
		var textRunsLength = element.textRuns.length;
		for(var k = 0 ; k < textRunsLength ; k++)
		{
			text += element.textRuns[k].characters;
		}
		data.text = text;
		if(element.textType == "input")
		{
			data.class = "TextInput";
		}
		else
		{
			data.class = "TextField";
		}
		if(parentElement && parentElement.symbolType == "button")
		{
			data.frame = 9;
		}
	}
	else if(element.symbolType == "graphic")
	{
		data.class = "DisplayObjectContainer";
		//fl.trace("不支持graphic");
	}
	else if(element.symbolType == "button")
	{
		data.class = "SimpleButton";
		data.children = [];
		lib.editItem(element.libraryItem.name);
		loopContainer(data, element);
	}
	else
	{
		data.class = "DisplayObjectContainer";
		//for (var key in element){
		//	fl.trace(key +"     " +element[key])
		//}
	}
}

var totalViewData = {};
var buildView = function (){
	var first = true;
	var itemsLength = lib.items.length;
	for(var o = 0 ; o < itemsLength ; o++)
	{
		var item = lib.items[o];
		if(item.linkageClassName && item.linkageClassName != "")
		{
			viewData = {};
			viewData.class = "DisplayObjectContainer";
			viewData.children = [];
			lib.editItem(item.name);
			loopContainer(viewData);
			totalViewData[item.linkageClassName] = viewData;
		}
	}
}
buildView();

var output = function (){
	var totalData = {};
	totalData.viewData = totalViewData;
	totalData.resourceData = [];
	for(var i = 0 ; i < bitmapNameList.length ; i++)
	{
		var name = bitmapNameList[i];
		totalData.resourceData.push(path + name);
	}
	fl.trace(JSON.stringify(totalData));
}
output();

//导出图片
var exporeImage = function (){
	var itemsLength = lib.items.length;
	for(var i = 0 ; i < itemsLength ; i++)
	{
		var item = lib.items[i];
		if(bitmapNameList.indexOf(item.name) != -1)
		{
			var path = dom.pathURI.replace(dom.name,"");
			if(item.exportToFile)
			{
				item.exportToFile(path + item.name);
			}
			else
			{
				lib.editItem(item.name);
				dom.width=item.width^0;
				dom.height=item.height^0;
				dom.exportPNG(path + item.name);
			}
		}
	}
}
exporeImage();
