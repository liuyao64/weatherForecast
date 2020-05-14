// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
// 云函数入口函数
exports.main = async (event, context) => {
	console.log(event)
	return sendTemplateMessage(event)
}

//小程序模版消息推送
async function sendTemplateMessage(event) {
	const {OPENID} = cloud.getWXContext()
	const templateId = 'dj1cnpHivaE8MPHXlbCEnG5iz4-dN-a90xMyU9p-0uY'
	const data = {
		'date1': {
			value: event.date,
		},
		'phrase2': {
			value: event.location,
		},
		'phrase3': {
			value: event.cond_txt,
		},
		'character_string4': {
			value: event.tmp,
		},
		'thing5': {
			value: event.tip,
		},
	}
	const sendResult = await cloud.openapi.subscribeMessage.send({
		touser: OPENID,
		templateId: templateId,
		page: 'pages/index/index',
		data: data,
		miniprogramState: 'developer'
	})

	return sendResult
}
