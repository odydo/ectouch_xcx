//城市选择
var app = getApp();
Page({
  data: {
    shengArr: [],//省级数组
    shengId: [],//省级id数组
    shiArr: [],//城市数组
    shiId: [],//城市id数组
    quArr: [],//区数组
    shengIndex: 0,
    shiIndex: 0,
    quIndex: 0,
    mid: 0,
    sheng:0,
    city:0,
    area:0,
    code:0,
    cartId:0
  },
  formSubmit: function (e) {
    var adds = e.detail.value;
    var cartId = this.data.cartId;
    var that=this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Address/add_adds',
      data: {
        user_id:app.d.userId,
        receiver: adds.name,
        tel: adds.phone,
        sheng: that.data.sheng,
        city: that.data.city,
        quyu: that.data.area,
        adds: adds.address,
        address_id: adds.address_id
        //code: this.data.code,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {// 设置请求的 header
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // success
        var status = res.data.status;
        if(status==1){
          wx.showToast({
            title: '保存成功！',
            duration: 2000
          });
        }else{
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
        wx.redirectTo({
          url: 'user-address/user-address?cartId=' + cartId
        });
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })


  }, 
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var that = this;
    that.setData({
      cartId: options.cartId
    })
    //获取省级城市
    wx.request({
      url: app.d.ceshiUrl + '/Api/Address/get_province',
      data: {},
      method: 'POST',
      success: function (res) {
        var status = res.data.status;
        var province = res.data.list;
        var sArr = [];
        var sId = [];
        sArr.push('请选择');
        sId.push('0');
        for (var i = 0; i < province.length; i++) {
          sArr.push(province[i].region_name);
          sId.push(province[i].region_id);
        }
        that.setData({
          shengArr: sArr,
          shengId: sId
        })
        //console.log(that.data.shengArr)
        //console.log(that.data.shengId)
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！', 
          duration: 2000
        });
      },
    })

  },

  bindPickerChangeshengArr: function (e) {
    
    var value = e.detail.value
    this.setData({
      shengIndex: value,
      shiArr: [],
      shiId: [],
      quArr:[],
      quiId: []
    });
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Address/get_city',
      data: { sheng: that.data.shengId[value]},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {// 设置请求的 header
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // success
        var status = res.data.status;
        var city = res.data.city_list;

        var hArr = [];
        var hId = [];
        hArr.push('请选择');
        hId.push('0');
        for (var i = 0; i < city.length; i++) {
          hArr.push(city[i].region_name);
          hId.push(city[i].region_id);
        }
        that.setData({
          sheng: that.data.shengId[value],
          shiArr: hArr,
          shiId: hId
        })
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },

    })
  },
  bindPickerChangeshiArr: function (e) {
    var value = e.detail.value
    this.setData({
      shiIndex: value,
      quArr:[],
      quiId: []
    })
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Address/get_area',
      data: {
        city: that.data.shiId[value],
        sheng:this.data.sheng
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {// 设置请求的 header
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        var area = res.data.area_list;

        var qArr = [];
        var qId = [];
        qArr.push('请选择');
        qId.push('0');
        for (var i = 0; i < area.length; i++) {
          qArr.push(area[i].region_name)
          qId.push(area[i].region_id)
        }
        that.setData({
          city: that.data.shiId[value],
          quArr: qArr,
          quiId: qId
        })
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
  },
  bindPickerChangequArr: function (e) {
    var value = e.detail.value
    this.setData({
      quIndex: value
    });
    var that = this;
    that.setData({
      area: that.data.quiId[value],
      //code: res.data.code
    })
    /*wx.request({
      url: app.d.ceshiUrl + '/Api/Address/get_code',
      data: {
        quyu:e.detail.value,
        city:this.data.city
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {// 设置请求的 header
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          area: e.detail.value,
          code:res.data.code
        })
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })*/
  }

})