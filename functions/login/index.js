// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
	console.log('openId:', event)
	let uid = ''
	let openId = event.userInfo.openId
	let user = await db.collection('user').where({
		openId: openId
	}).get()

	console.log('user:', user)
	if (user.data.length == 0 || !user.data) {
		let addUser = await db.collection('user').add({
			data:{
				openId:openId
			}
		})
		console.log('uid:',addUser)
		uid = addUser._id
	}else{
		uid = user.data[0]._id
	}
	return uid
}
