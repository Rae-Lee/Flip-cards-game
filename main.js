
const GAME_STATE = {
  FirstCardAwaits:'FirstCardAwaits',
  SecondCardAwaits:'SecondCardAwaits',
  CardsMatchFailed:'CardsMatchFailed',
  CardsMatched:'CardsMatched',
  GameFinished:'GameFinished'
}
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const cards = []
const card = document.querySelectorAll('.card')
const score = document.querySelector('.score')
const tried = document.querySelector('.tried')


// ==========model=========================
const model = {
  revealedCards:[],
  score : 0,
  triedTimes : 0,
  isRevealCardMatched(){
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  addTriedTimes(){
    this.triedTimes += 1
    return this.triedTimes
  },
  addScore(){
    this.score += 10
    return this.score
  }
}

// ==============view=======================

const view = {
  getCardContainer(index){
    return `
      <div data-index="${index}" class="card back">
      </div>`
  },
  getCardContent(index){
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Math.floor(index / 13)
    return`
    <p>${number}</p>
      <img src=${Symbols[symbol]} alt="">
      <p>${number}</p>
     `
  },
 
  transformNumber(number){
    switch(number){
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
  },
  renderCards(index){
     const panel = document.querySelector('#cards')
    panel.innerHTML += this.getCardContainer(index) 
  },
  createArray(account){
    for (i = 0; i <= (account - 1); i++) {
      cards.push(i)
    }
  },
  displayCards(randomArray){
    randomArray
    cards.forEach(card => this.renderCards(card))
  },
  flipCards(...cards){
    cards.map((card) =>{
      // 若是背面翻正面
      if (card.classList.contains('back')) {
        card.classList.toggle('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
      }
      // 若是正面翻背面
      else {
        card.classList.toggle('back')
        card.innerHTML = null
      }
    })
  },
  pairedCards(...cards){
    cards.map((card) => card.classList.add('gray')
  ) 
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards){
    cards.map(card =>{
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(){
     
     for(i = (cards.length - 1); i >= 0; i--){
       let randomIndex = Math.floor(Math.random() * (i + 1));
       [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]]
     }
     return cards
  }
}

// =====controller=========
const controller = {
  currentState:GAME_STATE.FirstCardAwaits,
  generateCards(){
    view.createArray(52)
    view.displayCards(utility.getRandomNumberArray())
  },
  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card){
    if (!card.classList.contains('back') || card.classList.contains('gray'))return //不用再做 任何事情
   
    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits: 
      
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

   
   
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(model.addTriedTimes())
        if (model.isRevealCardMatched()){
          this.currentState = GAME_STATE.CardsMatched
          view.pairedCards(...model.revealedCards)
          view.renderScore(model.addScore()) 
          model.revealedCards = []
          if (model.score === 260){
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
          return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
          break
        }else{
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          this.resetCards()
          break
        }
    }
  },
  resetCards(){
    setTimeout(() => {
      view.flipCards(...model.revealedCards)
      model.revealedCards = []
      controller.currentState = GAME_STATE.FirstCardAwaits
    }, 1000)
  }
}
// =========Execute================
controller.generateCards()
document.querySelectorAll('.card').forEach(item => {
  item.addEventListener('click', event =>{
    controller.dispatchCardAction(item)
  })
})