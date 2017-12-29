//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  firstIndex: -1, 
  data:{
    bannerApp:true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换  
    productId:0,
    itemData:{},
    bannerItem:[],
    buynum:1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    firstIndex: -1,
    //准备数据
    //数据结构：以一组一组来进行设定
     //commodityAttr:[],
    canValueList:[],
     attrValueList: []
  },

  // 弹窗
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })

    this.animation = animation
    animation.translateY(300).step();
    
    this.setData({
      animationData: animation.export()
    })

    if (e.currentTarget.dataset.status == 1) {

      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },
  // 加减
  changeNum:function  (e) {
    var that = this;
    if (e.target.dataset.alphaBeta == 0) {
        if (this.data.buynum <= 1) {
            buynum:1
        }else{
            this.setData({
                buynum:this.data.buynum - 1
            })
        };
    }else{
        this.setData({
            buynum:this.data.buynum + 1
        })
    };
  },
  // 传值
  onLoad: function (option) {     
    //this.initNavHeight();
    var that = this;
    that.setData({
      productId: option.productId,
    });
    that.loadProductDetail();

  },
// 商品详情数据获取
  loadProductDetail:function(){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/index',
      method:'post',
      data: {
        pro_id: that.data.productId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data 
        var status = res.data.status;
        if(status==1) {   
          var pro = res.data.pro;
          var content = pro.goods_desc;
          //that.initProductData(data);
          WxParse.wxParse('content', 'html', content, that, 3);
          that.setData({
            itemData:pro,
            bannerItem:pro.img_arr,
            //commodityAttr: res.data.properties.spe,
            attrValueList: res.data.properties.spe,
            canValueList: res.data.properties.pro
          });
        } else {
          wx.showToast({
            title:res.data.err,
            duration:2000,
          });
        }
        
      },
      error:function(e){
        wx.showToast({
          title:'网络异常！',
          duration:2000,
        });
      },
    });
  },
// 属性选择
  onShow: function () {
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    
    var that = this;
    var _attrValueList = that.data.attrValueList;
    var specNameId = e.currentTarget.dataset.nameId;
    var specValueId = e.currentTarget.dataset.valueId;
    for (var i in _attrValueList) {
      if (_attrValueList[specNameId]) {
        for (var j in _attrValueList[i].values) {
          if (_attrValueList[specNameId].values[j].id == specValueId) {
            
            _attrValueList[specNameId].values[j].checked = true;
            
          } else {
            _attrValueList[specNameId].values[j].checked = false;
          }
        }
      }
    }
   
    that.setData({
      'attrValueList': _attrValueList
    });
  },
  
  //添加到收藏
  addFavorites:function(e){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/col',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if(data.status == 1){
          wx.showToast({
            title: '操作成功！',
            duration: 2000
          });
          //变成已收藏，但是目前小程序可能不能改变图片，只能改样式
          that.data.itemData.isCollect = true;
        }else{
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  addShopCart:function(e){ //添加到购物车
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Shopping/add',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
        num: that.data.buynum,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if(data.status == 1){
          var ptype = e.currentTarget.dataset.type;
          if(ptype == 'buynow'){
            wx.redirectTo({
              url: '../order/pay?cartId='+data.cart_id
            });
            return;
          }else{
            wx.showToast({
                title: '加入购物车成功',
                icon: 'success',
                duration: 2000
            });
          }     
        }else{
          wx.showToast({
                title: data.err,
                duration: 2000
            });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  addToCart: function (e) {
    var that = this;
    var length = 0;
    var spec_arr = [];
    var quick = 0;
    var ptype = e.currentTarget.dataset.type;
    for (var m in that.data.attrValueList){
        length ++;
    }
    if (length > 0) {
      
      //提示选择完整规格
      if (this.isCheckedAllSpec()) {
        wx.showToast({
          title: '请选择规格',
          duration: 2000
        });
        return false;
      }
      //已选择规格
      var str = this.getCheckedSpecKey();
      spec_arr = str.split(',');
      var quick = 1;
      
    } 
    //添加到购物车
    wx.request({
      url: app.d.ceshiUrl + '/Api/Shopping/add',
      method: 'post',
      data: {
        uid: app.d.userId,
        goods_id: that.data.productId,
        number: that.data.buynum,
        quick:quick,
        spec:spec_arr
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if (data.status == 1) {
          if (ptype == 'buynow') {
            wx.redirectTo({
              url: '../order/pay?cartId=' + data.cart_id
            });
            return;
          } else {
            wx.showToast({
              title: '加入购物车成功',
              icon: 'success',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  //获取选中的规格信息
  getCheckedSpecValue: function () {
    let checkedValues = [];
    let _specificationList = this.data.attrValueList;
    for (let i in _specificationList) {
      let _checkedObj = {
        nameId: _specificationList[i].id,
        valueId: 0,
        valueText: ''
      };
      for (let j in _specificationList[i].values) {
        if (_specificationList[i].values[j].checked) {
          _checkedObj.valueId = _specificationList[i].values[j].id;
          _checkedObj.valueText = _specificationList[i].values[j].label;
        }
      }
      checkedValues.push(_checkedObj);
    }
    return checkedValues;

  },

  //判断规格是否选择完整
  isCheckedAllSpec: function () {
    
    this.getCheckedSpecValue().some(function (v) {
      if (v.valueId == 0) {
       return false;
      }
    });
  },
  getCheckedSpecKey: function () {
    let checkedValue = this.getCheckedSpecValue().map(function (v) {
      return v.valueId;
    });

    return checkedValue.join(',');
  },
  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  initNavHeight:function(){////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed:function(){
    this.setData({
      bannerApp:false,
    })
  },
  swichNav: function (e) {//点击tab切换
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
});
