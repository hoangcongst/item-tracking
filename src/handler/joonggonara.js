import axios from 'axios'
import cryptojs from 'crypto-js'
import { ENGINE } from '../engines.js'
const { MD5 } = cryptojs

const blackList = [
    '매입',
    '캐논',
    '니콘',
    '소니'
]

export const handle = async (botTele, chatId, repository, keyword, filter) => {
    const apiLink = `https://apis.naver.com/cafe-web/cafe-mobile/CafeMobileWebArticleSearchListV3?cafeId=10050146&query=${encodeURI(keyword)}&searchBy=1&sortBy=date&page=1&perPage=20&adUnit=MW_CAFE_BOARD&ad=true`
    const response = await axios.get(apiLink)
    const results = response.data.message.result.articleList
    const primaryKey = ENGINE.JOONGGO + MD5(keyword).toString()
    const previousArticles = (await repository.getById(primaryKey))?.articles
    const currentArticles = resultToDB(results)
    let newArticles = [];
    if (previousArticles) {
        newArticles = currentArticles.filter(currentArticle => !previousArticles.find(previousArticle => previousArticle.cafeId === currentArticle.cafeId
            && previousArticle.articleId === currentArticle.articleId && previousArticle.price === currentArticle.price))
    }

    const messages = []
    newArticles.forEach(article => messages.push(`${article.created_at} <b>${article.price}원</b> ${article.subject} https://cafe.naver.com/joonggonara/${article.articleId}`))
    const message = messages.join('\n\n')
    if (message.length > 0) {
        await botTele.sendMessage(chatId, message, {
            "parse_mode": "HTML"
        })

        previousArticles.push(...newArticles)
        if (previousArticles.length > 100)
            previousArticles = previousArticles.slice(previousArticles.length - 100)

        await repository.put({
            pk: primaryKey,
            articles: previousArticles
        })
    }
}

const isAdvertise = (title) => {
    let occurances = 0
    blackList.forEach((blackToken) => {
        if (title.indexOf(blackToken) > -1) occurances++
    })
    return occurances > 2
}

const resultToDB = (results) => {
    const data = []
    results.forEach(article => {
        if (article.type === 'ARTICLE' && !isAdvertise(article.item?.subject)) {
            article = article.item
            data.push({
                cafeId: article.cafeId,
                articleId: article.articleId,
                subject: article.subject?.replace("<em>", "").replace("</em>", "").replace(/[^ |ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\w]+/g, ""),
                thumbnail: article.thumbnailImageUrl,
                created_at: article.addDate,
                saleStatus: article.productSale?.saleStatus,
                price: article.productSale?.cost,
                writeTime: article.writeTime,
                regionList: article.productSale?.regionList?.length > 0 ?
                    `${article.productSale.regionList[0].regionName1} ${article.productSale.regionList[0].regionName2} ${article.productSale.regionList[0].regionName3}` : ''
            })
        }
    });
    return data
}