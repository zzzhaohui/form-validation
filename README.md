### 特点 

* 0依赖，只需引用一个js和css即可
* 样式可自己定制，也可使用默认样式
* 一个页面同时实例化多个组件
* jquery zepto angular vue react均适用
* 支持最多6级级联
* 支持设置高度和高度单位
* 适用于android和iOS设备(PC端支持IE9+，不过PC端上滑动体验不太实用)


### 起步 

* npm

``` javascript
npm install iosselect
```

* 实例化组件

``` javascript
var oneLeve = [{'id': '10001', 'value': '演示数据1', parentId: '0' }] //第一列数据
var twoLeve = [{'id': '10001', 'value': '演示数据1', parentId: '0' }]
var data = [oneLeve, twoLeve]
selecePicker(){
    this.$IosSelect(
        3,  //表示级联层级
        [data],  //数据
        {
            title: "地址选择", //标题
            itemHeight: 35, //每一个元素的高度
            relation: [1, 1], //是否关联上一列
            sureText: "保存", //按钮
            oneLevelId: 110000, //第一列 默认值
            twoLevelId: 110100, //第二列 默认值
            threeLevelId: 110101, //第三列 默认值
            callback: function (selectDataObj) {
                // selectDataObj 返回数据
            }
    });
}