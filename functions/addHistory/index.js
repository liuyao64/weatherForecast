// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
	let addObj = event.addObj
	let hisRes = await db.collection('searchHistory').where({
		uid: addObj.uid
	}).get()
	console.log('hisRes:',hisRes)
	let historyArr = hisRes.data 
	let diff = false
	for(let i =0;i<historyArr.length;i++){
		if (historyArr[i].location == addObj.location) {
			diff = true;
			break;
		}
	}
	if(!diff){ // 没有重复
		let addRes = db.collection('searchHistory').add({
			data: addObj
		})
		return addRes;
	}
}
