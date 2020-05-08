<template>
	<div>
		<div class="top" v-if="JSON.stringify(weatherInfo)!='{}'">
			<div class="flex-row center" @click="changeCity">
				<image src="../../static/images/icon/icon-location-f.png" mode="" class="icon-location"></image>
				<div class="font-30 font-fff mg_lt_20">
					{{weatherInfo.basic.location}}
				</div>
				<image src="../../static/images/icon/arrow-right.png" mode="" class="icon-arrow mg_lt_10"></image>
			</div>
			<div class="weather-box font-fff font-30 font-thin mg_tp_20 text-center">
				<div class="font-100">
					{{weatherInfo.now.tmp}}°C
				</div>
				<div>
					{{weatherInfo.now.cond_txt}} | <span class="mg_lt_20">空气质量：{{airInfo.air_now_city.qlty?airInfo.air_now_city.qlty:'--'}}</span>
				</div>
				<div class="mg_tp_10">
					{{weatherInfo.now.wind_dir}}{{weatherInfo.now.wind_sc}}级 湿度：{{weatherInfo.now.hum}}
				</div>
			</div>
		</div>
		<!-- 小时预报 -->
		<scroll-view scroll-x="true" class="hourly-box" v-if="hourlyArr.length>0">
			<div v-for="item in hourlyArr" class="hourly-item">
				<div class="font-999">{{item.time.substr(11,5)}}</div>
				<image :src="utils.weatherIcon(item.cond_txt)" mode="" class="icon-weather mg_tp_10"></image>
				<div class="font-666">{{item.cond_txt}} | {{item.tmp}}°C</div>
			</div>
		</scroll-view>
		<!-- 未来7天预报 -->
		<div class="forecast-box" v-if="forecastArr.length>0">
			<div class='forecast-box-title'>7天预报</div>
			<scroll-view scroll-x="true" class="forecast-scroll-box" v-if="forecastArr.length>0">
				<div v-for="item in forecastArr" class="forecast-item">
					<div class="font-999">{{item.date.substr(5,5)}}</div>
					<div class="font-666 mg_tp_10">{{item.tmp_max}}°C / {{item.tmp_min}}°C</div>
					<div class="font-666 mg_tp_10">{{item.cond_txt_d}}</div>
					<image :src="'../../static/images/cond-icon-heweather/'+item.cond_code_d+'.png'" mode="" class="forecast-icon"></image>
					<div class="line-v"></div>
					<image :src="'../../static/images/cond-icon-heweather/'+item.cond_code_n+'n.png'" mode="" class="forecast-icon"
					 v-if="item.cond_code_n==(100||103||104||300||301||406||407)"></image>
					<image :src="'../../static/images/cond-icon-heweather/'+item.cond_code_n+'.png'" mode="" class="forecast-icon"
					 v-else></image>
					<div class="font-666 mg_tp_10">{{item.cond_txt_n}}</div>
				</div>
			</scroll-view>
		</div>
		<!-- 生活指数 -->
		<div class="forecast-box" v-if="JSON.stringify(weatherInfo)!='{}'&&lifestyleArr.length>0">
			<div class="forecast-box-title">生活指数</div>
			<div class="wrap">
				<div class="lifestyle-item">
					<image src="../../static/images/lifestyle/fl.png" mode="" class="lifestyle-icon"></image>
					<div class="font-999">体感温度</div>
					<div class="font-666 mg_tp_10">{{weatherInfo.now.fl?weatherInfo.now.fl:'--'}}°C</div>
				</div>
				<div class="lifestyle-item" v-for="item in lifestyleArr" @click="showModal(item.txt)">
					<image :src="'../../static/images/lifestyle/'+item.type+'.png'" mode="" class="lifestyle-icon"></image>
					<div class="font-999">{{utils.lifestyleIcon(item.type).name}}</div>
					<div class="font-666 mg_tp_10">{{item.brf}}</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script module="utils" lang="wxs" src="../../utils.wxs"></script>
<script>
	const app = getApp();
	export default {
		data() {
			return {
				lngLat: '',
				weatherInfo: {},
				airInfo: {},
				hourlyArr: [],
				forecastArr: [],
				lifestyleArr: [],
			}
		},
		onShow() {
			console.log('key:', app.globalData.key)
			uni.showLoading({
				title: '努力加载中…',
			})
			if (uni.getStorageSync('lngLat')) {
				this.lngLat = uni.getStorageSync('lngLat')
				this.getNowWeather();
				this.getNowAirQuality();
				this.getHourlyWeather();
				this.getForecastWeather();
				this.getLifestyle();
			} else {
				// #ifdef MP-WEIXIN
				this.getLocationWx();
				// #endif

				// #ifdef H5
				this.getLocationH5();
				// #endif
			}
		},
		methods: {
			iconFilter(data) {
				console.log(data)
				switch (data) {
					case '多云':
						icon = '../../static/images/weatherIcon/more-cloud.png';
						break;
				}
			},
			getLocationWx() {
				let that = this
				// console.log('getLocation Wx')
				uni.authorize({
					scope: 'scope.userLocation',
					success() {
						uni.getLocation({
							type: 'wgs84',
							success: function(res) {
								console.log('当前位置：', res);
								let lng = res.longitude
								let lat = res.latitude
								that.lngLat = lng + ',' + lat
								that.getNowWeather();
								that.getNowAirQuality();
								that.getHourlyWeather();
								that.getForecastWeather();
								that.getLifestyle();
							},
						});
					}
				})
			},
			getLocationH5() {
				let that = this
				console.log('getLocation H5')
				uni.getLocation({
					type: 'wgs84',
					success: function(res) {
						console.log('当前位置：', res);
						let lng = res.longitude
						let lat = res.latitude
						that.getNowWeather();
						that.getNowAirQuality();
						that.getHourlyWeather();
						that.getForecastWeather();
						that.getLifestyle();
					}
				});
			},
			getNowWeather() {
				let that = this
				let url = 'https://free-api.heweather.net/s6/weather/now?location=' + this.lngLat + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.weatherInfo = res.data.HeWeather6[0]
						
						if(uni.getStorageSync('location')){
							that.weatherInfo.basic.location = uni.getStorageSync('location')
						}
						uni.hideLoading()
						console.log('weather:', that.weatherInfo)
					}
				})
			},
			getNowAirQuality() {
				let that = this
				let url = 'https://free-api.heweather.net/s6/air/now?location=' + this.lngLat + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.airInfo = res.data.HeWeather6[0]
						console.log('air quality:', that.airInfo)
					}
				})
			},
			getHourlyWeather() {
				let that = this
				let url = 'https://free-api.heweather.net/s6/weather/hourly?location=' + this.lngLat + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.hourlyArr = res.data.HeWeather6[0].hourly
						console.log('hourlyArr:', that.hourlyArr)
					}
				})
			},
			getForecastWeather() {
				let that = this
				let url = 'https://free-api.heweather.net/s6/weather/forecast?location=' + this.lngLat + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.forecastArr = res.data.HeWeather6[0].daily_forecast
						console.log('forecastArr:', that.forecastArr)
					}
				})
			},
			getLifestyle() {
				let that = this
				let url = 'https://free-api.heweather.net/s6/weather/lifestyle?location=' + this.lngLat + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.lifestyleArr = res.data.HeWeather6[0].lifestyle
						console.log('lifestyle:', that.lifestyleArr)
					}
				})
			},
			changeCity() {
				uni.navigateTo({
					url: "../city/city"
				})
			},
			showModal(txt){
				uni.showModal({
				    title: '温馨提示',
				    content: txt,
					showCancel: false,
					confirmText: '知道了',
					confirmColor: '#7dbbfa',
				    success: function (res) {
				    }
				});
			}
		},
	}
</script>

<style>
	page {
		height: 100%;
		background-color: #f5f5f5;
	}

	.top {
		padding: 30rpx;
		font-size: 28rpx;
		background-color: #7dbbfa;
	}

	.icon-location {
		width: 30rpx;
		height: 30rpx;
	}

	.icon-arrow {
		width: 28rpx;
		height: 28rpx;
	}

	.weather-box {
		width: 690rpx;
		background-color: #7dbbfa;
	}

	.hourly-box {
		width: 690rpx;
		margin: 30rpx;
		border-radius: 10rpx;
		background-color: #FFFFFF;
		color: #333333;
		font-size: 28rpx;
		overflow: hidden;
		white-space: nowrap;
	}


	.hourly-item {
		display: inline-block;
		text-align: center;
		width: 180rpx;
		height: 160rpx;
		padding: 20rpx 0;
	}

	.icon-weather {
		width: 56rpx;
		height: 56rpx;
	}

	.forecast-box {
		width: 690rpx;
		margin: 0 30rpx 30rpx 30rpx;
		border-radius: 10rpx;
		background-color: #FFFFFF;
		color: #333333;
		font-size: 28rpx;
	}

	.forecast-box-title {
		width: 630rpx;
		padding: 0 30rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-bottom: 1rpx solid #eee;
	}

	.forecast-scroll-box {
		width: 690rpx;
		overflow: hidden;
		white-space: nowrap;
	}

	.forecast-item {
		display: inline-block;
		text-align: center;
		width: 172rpx;
		height: 320rpx;
		padding: 20rpx 0;
	}

	.line-v {
		width: 1rpx;
		height: 36rpx;
		border-right: 2rpx dashed #ccc;
		margin-left: 85rpx;
	}

	.forecast-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.wrap {
		overflow: hidden;
		white-space: normal;
	}

	.lifestyle-item {
		width: 229rpx;
		height: 190rpx;
		padding: 20rpx 0;
		display: inline-block;
		text-align: center;
		border-right: 1rpx solid #eee;
		border-top: 1rpx solid #eee;
	}

	.lifestyle-item:nth-child(3n) {
		border-right: 0;
	}

	.lifestyle-item:nth-child(-n+3) {
		border-top: 0;
	}

	.lifestyle-icon {
		width: 84rpx;
		height: 84rpx;
	}

	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
	}
</style>
