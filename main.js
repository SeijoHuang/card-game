const GAME_STATE = {
  FirstCardAwaits: ' FirstCardAwaits ',
  SecondsCardAwaits: 'SecondsCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardMatched',
  GamedFinished: 'GamedFinished'
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
// 介面
const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  }
  ,
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>   
      `
  }
  ,
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  }
  ,
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score:${score}`
  },
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationed', event =>
        event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete</p>
      <p>Score:${model.score}</p>
      <p>You've tried: ${model.time} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}
// 資料
const model = {
  // 暫存牌組，每次翻牌時將卡片丟入revealCards陣列，滿兩張檢查是否配對成功，檢查完後清空
  revealCards: [],
  isRevealedCardsMatched() {
    return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
  },
  score: 0,
  time: 0
}
// 流程
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  //亂數產生卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.time)
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondsCardAwaits
        return
      case GAME_STATE.SecondsCardAwaits:
        view.flipCards(card)
        model.revealCards.push(card)
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore((model.score += 10))
          console.log('this.currentState', this.currentState)
          view.pairCards(...model.revealCards)
          model.revealCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
          if (model.score === 260) {
            this.currentState = GAME_STATE.GamedFinished
            view.showGameFinished()
            return
          }
          return
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000)

        }


      // case GAME_STATE.GamedFinished:
    }
    console.log('this.currentState', this.currentState),
      console.log('revealedCards ', model.revealCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
    console.log('this.currentState', controller.currentState)
  }
}


const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let indexRandom = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[indexRandom]] = [number[indexRandom], number[index]]
    }
    return number
  }
}


controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', (event) => {
    controller.dispatchCardAction(card)
  })
})
