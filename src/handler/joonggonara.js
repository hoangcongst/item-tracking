import axios from 'axios'
import cryptojs from 'crypto-js'
const { MD5 } = cryptojs

export const handleJoonggonara = async (botTele, chatId, repository, keyword, filter) => {
    const apiLink = `https://apis.naver.com/cafe-web/cafe-search-api/v4.0/trade-search/all?query=${encodeURI(keyword)}&page=1&size=10&recommendKeyword=true&searchBy=1&searchOrderParamType=DEFAULT&escrows=DIRECT&regionCode=&cost.min=${filter ? filter.min : ''}&cost.max=${filter ? filter.max : ''}`
    const response = await axios.get(apiLink)
    const results = response.data.result.tradeArticleList
    const primaryKey = 'joonggo' + MD5(keyword).toString()
    const previousArticles = (await repository.getById(primaryKey))?.articles
    const currentArticles = resultToDB(results)
    let newArticles = [];
    if (previousArticles) {
        newArticles = currentArticles.filter(currentArticle => !previousArticles.find(previousArticle => previousArticle.cafeId === currentArticle.cafeId
            && previousArticle.articleId === currentArticle.articleId && previousArticle.price === currentArticle.price))
    }

    const messages = []
    newArticles.forEach(article => messages.push(`<b>${article.price}원</b> ${article.subject} https://cafe.naver.com/joonggonara/${article.articleId}`))
    const message = messages.join('\n\n')
    if (message.length > 0)
        await botTele.sendMessage(chatId, message, {
            "parse_mode": "HTML"
        })
    await repository.put({
        pk: primaryKey,
        articles: currentArticles
    })
}

const resultToDB = (results) => {
    const data = []
    results.forEach(article => {
        if (article.type === 'ARTICLE') {
            article = article.item
            data.push({
                cafeId: article.cafeId,
                articleId: article.articleId,
                subject: article.subject?.replace("<", "").replace(">", ""),
                thumbnail: article.thumbnailImageUrl,
                created_at: article.addDate,
                saleStatus: article.productSale?.saleStatus,
                price: article.productSale?.cost,
                regionList: article.productSale?.regionList?.length > 0 ?
                    `${article.productSale.regionList[0].regionName1} ${article.productSale.regionList[0].regionName2} ${article.productSale.regionList[0].regionName3}` : ''
            })
        }
    });
    return data
}