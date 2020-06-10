# 表单验证

### 特点

* 其包含功能有，表单验证（非空，正则）、picker（单列及其多列选择）、image上传
* 表单验证
* * 大撒大撒



## Validator

## 特点

* 

### 起步

* npm 

```javascript
npm install async-validator --save
```

## Picker

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
var twoLeve = [{'id': '10001', 'value': '演示数据1', parentId: '0' }] //第二列数据
    ...
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
```

### 如果要修改菜单项里样式，请自行修改样式，比如：

.ios-select-widget-box ul li

### 参数说明

#### level

	default: 1
	type:    number

数据的层级，最多支持6层

#### data

	default: undefined
	type:    ...Array

[oneLevelData[, twoLevelData[, threeLevelData[, fourLevelData[, fiveLevelData[, sixLevelData]]]]]] 可以用数组，也可以用方法。
6项分别对应级联1,2,3,4,5,6项，每一项又是一个数组或方法
如果是数组：
每一项数组中包含一系列对象，每个对象必须要有id,作为该条数据在该项数组中的唯一标识，value作为显示值，parentId是可选属性，作为关联的标志，数据形如：

```
var iosProvinces = [
  {"id": "130000', "value": "河北省", "parentId": "0"}
];
var iosCitys = [
  {"id":"130100","value":"石家庄市","parentId":"130000"},
];
```

在方法里可以根据前序列的选中值定义需要的数据，比如年月日，当年月变化时，可根据年月选中值，设置日期的取值范围。

#### options

	type:    object

其余选项，含以下几个属性：

#### options.container

	default: ''
	type:    string

实例化后的对象包裹元素，可选项

#### options.callback

	default: undefined
	type:    function

选择完毕后的回调函数，必选项
options.callback(selectOneObj, selectTwoObj, selectThreeObj, selectFourObj, selectFiveObj, selectSixObj) selectNumberObj为每级对应选中项，包含对应数据的所有字段及dom对象

#### options.fallback

    default: undefined
    type:    function

选择取消后的回调函数，可选项

#### options.maskCallback

    default: undefined
    type:    function
    
点击背景层关闭组件时触发的方法，可选项

#### options.title

	default: ''
	type:    string

显示标题，可选项

#### options.sureText

	default: '确定'
	type:    string

设置确定按钮文字，可选项

#### options.closeText

	default: '取消'
	type:    string

设置取消按钮文字，可选项

#### options.itemHeight

	default: 35
	type:    number

每一项的高度，可选项

#### options.itemShowCount

	default: 7
	type:    number

组件展示的项数，可选项，可选3,5,7,9，不过不是3,5,7,9则展示7项

#### options.headerHeight

	default: 44
	type:    number

组件标题栏高度，可选项

#### options.cssUnit

	default: 'px'
	type:    string

元素css尺寸单位，可选项，可选px或者rem

#### options.addClassName

	default: ''
	type:    string

组件额外类名，用于自定义样式，可选项

#### options.relation

	default: [0, 0, 0, 0, 0]
	type:    ...Array

[oneTwoRelation, twoThreeRelation, threeFourRelation, fourFiveRelation, fiveSixRelation]
可选项。如果数据是数组(非方法)，各级选项之间通过parentId关联时，需要设置；如果是通过方法获取数据，不需要该参数。

* options.relation.oneTwoRelation 

    第一列和第二列是否通过parentId关联，可选项

* options.relation.twoThreeRelation 

    第二列和第三列是否通过parentId关联，可选项

* options.relation.threeFourRelation 

    第三列和第四列是否通过parentId关联，可选项

* options.relation.fourFiveRelation 

    第四列和第五列是否通过parentId关联，可选项

* options.relation.fiveSixRelation 

    第五列和第六列是否通过parentId关联，可选项

#### options.oneLevelId

	type:    string

实例展示时，第一级数据默认选中值，可选项，默认为第一级数据第一项id

#### options.twoLevelId

	type:    string

实例展示时，第二级数据默认选中值，可选项，默认为第二级数据第一项id

#### options.threeLevelId

	type:    string

实例展示时，第三级数据默认选中值，可选项，默认为第三级数据第一项id

#### options.fourLevelId

	type:    string

实例展示时，第四级数据默认选中值，可选项，默认为第四级数据第一项id

#### options.fiveLevelId

	type:    string

实例展示时，第五级数据默认选中值，可选项，默认为第五级数据第一项id

#### options.sixLevelId

	type:    string

实例展示时，第6级数据默认选中值，可选项，默认为第6级数据第一项id

#### options.showLoading

	default: false
	type:    boolean

实例展示时，在数据加载之前下拉菜单是否显示加载中的效果，建议ajax获取数据时设置为true

#### options.showAnimate

    default: false
    type:    boolean

是否显示入场动画和退场动画，如需自定义动画效果，请覆写.fadeInUp .layer和.fadeOutDown .layer的css3动画。PS:动画时间为0.5秒。