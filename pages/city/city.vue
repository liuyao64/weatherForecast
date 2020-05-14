<template>
	<div>
		<div class="flex-row justify-between top">
			<div class="top-search">
				<image src="../../static/images/icon/icon-search.png" mode="" class="icon-search mg_lt_20"></image>
				<input type="text" value="" v-model="location" placeholder="请输入城市/地区" placeholder-style="color:#fff;" confirm-type="search"
				 class="mg_lt_20" @confirm="onConfirm" />
			</div>
			<div class="mg_lt_30 font-30" @click="goBack">取消</div>
		</div>

		<div class="title flex-row justify-between" v-if="!showSearch&&historyArr.length>0">
			<div>历史记录</div>
			<image src="../../static/images/icon/icon-delete.png" mode="" class="icon-delete" @click="clearHistory"></image>
		</div>
		<div class="wrap" v-if="!showSearch&&historyArr.length>0">
			<div class="hot-city" v-for="item in historyArr" @click="chooseHis(item)">
				{{item.location}}
			</div>
		</div>

		<div class="title" v-if="!showSearch">热门城市</div>
		<div class="wrap" v-if="!showSearch">
			<div class="hot-city" v-for="item in hotCityArr" @click="chooseLocation(item)">
				{{item.location==item.parent_city?item.location:item.location+'，'+item.parent_city}}
			</div>
		</div>

		<div class="search-title" v-if="showSearch">全部城市</div>
		<div class='search' v-if="showSearch">
			<div class="search-item" v-for="item in cityArr" @click="chooseLocation(item)">
				{{item.location+'，'+item.parent_city+'，'+item.admin_area+'，'+item.cnty}}
			</div>
			<div class="mg_tp_30 mg_bt_30 font-28 text-center">没有更多了～</div>
		</div>
	</div>
</template>

<script>
	const app = getApp();
	const db = wx.cloud.database()
	export default {
		data() {
			return {
				hotCityArr: [],
				cityArr: [],
				historyArr: [],
				location: '', // 需要查询的城市名称
				showSearch: false,
			}
		},
		onLoad() {
			this.getHotCity();
			this.getHistory();
		},
		methods: {
			addHistory(item) {
				let addObj = {
					uid: uni.getStorageSync('uid'),
					location: item.location,
					lat: item.lat,
					lng: item.lon
				}
				wx.cloud.callFunction({
					name: 'addHistory',
					data: {
						addObj
					}
				}).then(res => {
					console.log('addHistory res:', res)
				})
			},
			getHistory() {
				let that = this
				wx.cloud.callFunction({
					name: 'getHistory',
					data: {
						uid: uni.getStorageSync('uid')
					}
				}).then(res => {
					console.log('getHistory', res)
					that.historyArr = res.result.data
				})
			},
			clearHistory() {
				let that = this
				wx.cloud.callFunction({
					name: 'clearHistory',
					data: {
						uid: uni.getStorageSync('uid')
					}
				}).then(res => {
					console.log('clearHistory', res)
					if(res.result.errMsg == 'collection.remove:ok'){
						uni.showToast({
							title:'删除成功',
							icon:'none'
						})
						that.getHistory();
					}
				})
			},
			getHotCity() {
				let that = this
				let url = "https://search.heweather.net/top?group=world&key=" + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.hotCityArr = res.data.HeWeather6[0].basic
						console.log('hot city:', that.hotCityArr)
					}
				})
			},
			getCity() {
				let that = this
				let url = 'https://search.heweather.net/find?location=' + this.location + '&key=' + app.globalData.key
				uni.request({
					url: url,
					success(res) {
						that.cityArr = res.data.HeWeather6[0].basic
						that.showSearch = true
						console.log('search city:', that.cityArr)
					}
				})
			},
			onConfirm(event) {
				this.location = event.target.value
				console.log('confirm location:', this.location)
				this.getCity()
			},
			chooseLocation(item) {
				let that = this
				let lngLat = item.lon + ',' + item.lat
				uni.setStorageSync('lngLat', lngLat)
				uni.setStorageSync('location', item.location)
				this.addHistory(item)
				uni.navigateBack({
					delta: 1
				})
			},
			chooseHis(item) {
				let that = this
				let lngLat = item.lng + ',' + item.lat
				uni.setStorageSync('lngLat', lngLat)
				uni.setStorageSync('location', item.location)
				uni.navigateBack({
					delta: 1
				})
			},
			goBack() {
				uni.navigateBack({
					delta: 1
				})
			}
		}
	}
</script>

<style>
	page {
		background-color: #7dbbfa;
	}

	.top {
		margin: 30rpx 0;
		padding: 0 30rpx;
		color: #FFFFFF;
	}

	.top-search {
		width: 600rpx;
		height: 64rpx;
		line-height: 64rpx;
		border-radius: 8rpx;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		align-items: center;
	}

	.icon-search {
		width: 30rpx;
		height: 30rpx;
	}

	input {
		width: 530rpx;
		height: 64rpx;
		line-height: 64rpx;
	}

	.title {
		color: #fff;
		font-size: 30rpx;
		margin: 30rpx 30rpx 0rpx 30rpx;
	}

	.wrap {
		overflow: hidden;
		white-space: normal;
		width: 690rpx;
		margin: 0 30rpx;
	}

	.hot-city {
		display: inline-block;
		color: #fff;
		height: 60rpx;
		line-height: 60rpx;
		padding: 0 10rpx;
		margin-right: 20rpx;
		margin-top: 20rpx;
		background-color: rgba(0, 0, 0, 0.2);
	}

	/*.hot-city:nth-child(4n) {
		margin-right: 0;
	}

	.hot-city:nth-child(-n+4) {
		margin-top: 0;
	} */

	.search-title {
		background-color: rgba(0, 0, 0, 0.2);
		padding: 20rpx 30rpx;
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.search {
		margin: 0 30rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		margin-bottom: 30rpx;
	}

	.search-item {
		height: 100rpx;
		line-height: 100rpx;
		border-bottom: 1rpx solid #fff;
	}

	.icon-delete {
		width: 36rpx;
		height: 36rpx;
	}
</style>
